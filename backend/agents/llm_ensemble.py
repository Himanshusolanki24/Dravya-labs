"""
LLM Ensemble — parallel voting for critical / safety-sensitive prompts.

Runs the configured models in parallel, then a cheap "judge" model picks the
safest, most medically accurate answer (LLM-as-a-Judge).

Lightweight & resilient:
  • Only models whose provider key is configured actually run.
  • With 0-1 models available it degrades to a single call (no wasted spend).
"""

from __future__ import annotations

import asyncio
import logging

from agents.llm_client import call_llm_text, invoke_llm, invoke_provider, parse_model_id
from agents.llm_leagues import available_specs
from app.core.config import settings
from app.services import llm_quota

logger = logging.getLogger("dravya.llm_ensemble")

_JUDGE_PROMPT = """\
You are an expert Ayurvedic medical judge. Several assistants answered the same
user query. Pick the response that is (1) safest and most medically accurate,
(2) best aligned with Ayurvedic principles, (3) complete with proper disclaimers.

User query:
{prompt}

{candidates}

Reply with ONLY the number of the best response (e.g. "1").
"""


class LLMEnsemble:
    def __init__(self) -> None:
        configured = available_specs("high")
        if not configured:
            configured = [m.strip() for m in settings.LLM_ENSEMBLE_MODELS.split(",") if m.strip()]
        self.models: list[str] = []
        for m in configured:
            if m not in self.models:
                self.models.append(m)
        if not self.models:
            self.models = [settings.LLM_COMPLEX_MODEL]

    async def vote(
        self, system_prompt: str, user_message: str, *, user_id: str | None = None,
    ) -> tuple[str, str]:
        """Return (winning_text, model_used). Counts spend against the high league."""
        if user_id and await llm_quota.would_exceed(user_id, "high"):
            result = await invoke_llm(
                system_prompt, user_message, league="medium", user_id=user_id,
            )
            return result.text, result.model_id

        async def _one(spec: str) -> str:
            provider, name = parse_model_id(spec)
            result = await invoke_provider(provider, name, system_prompt, user_message)
            if user_id:
                await llm_quota.record(user_id, "high", result.total_tokens)
            return result.text

        if len(self.models) == 1:
            text = await _one(self.models[0])
            return text, self.models[0]

        results = await asyncio.gather(
            *(_one(m) for m in self.models),
            return_exceptions=True,
        )
        candidates = [
            (self.models[i], r)
            for i, r in enumerate(results)
            if not isinstance(r, Exception) and r
        ]
        if not candidates:
            raise RuntimeError("All ensemble models failed")
        if len(candidates) == 1:
            return candidates[0][1], candidates[0][0]

        block = "\n\n".join(f"Response {i+1}:\n{text}" for i, (_, text) in enumerate(candidates))
        try:
            verdict = await call_llm_text(
                "You are a careful medical judge. Reply with only a number.",
                _JUDGE_PROMPT.format(prompt=user_message, candidates=block),
                model=settings.LLM_JUDGE_MODEL,
                user_id=user_id,
                temperature=0.0, max_tokens=5,
            )
            idx = int("".join(ch for ch in verdict if ch.isdigit()) or "1") - 1
            idx = max(0, min(idx, len(candidates) - 1))
        except Exception as e:
            logger.warning("Judge failed, using first candidate: %s", e)
            idx = 0

        logger.info("Ensemble winner: %s (of %d)", candidates[idx][0], len(candidates))
        return candidates[idx][1], candidates[idx][0]
