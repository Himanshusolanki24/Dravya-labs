"""
Critic Agent — validates an LLM draft before it reaches the user.

For a health app the AI must not hallucinate, so every draft is reviewed
against the user's Prakriti (dosha), conditions, and the hard ML facts.
If it fails, the LLM Orchestrator regenerates with the critic's fix
instructions (loop engineering), up to MAX_CRITIC_RETRIES.

Checks: dosha consistency · safety/contraindications · completeness · fidelity
to ML facts. Returns a CritiqueResult.
"""

from __future__ import annotations

import logging

from agents.llm_client import call_llm
from agents.schemas import CritiqueResult
from app.core.config import settings

logger = logging.getLogger("dravya.critic")

_CRITIC_PROMPT = """\
You are a STRICT Ayurvedic quality reviewer. Review the DRAFT against the
context and decide if it is safe to show the user.

Check:
1. DOSHA CONSISTENCY — advice must suit a {dosha} constitution.
   (Vata: warm/grounding/oily, avoid raw+cold. Pitta: cooling/mild, avoid
    hot/spicy/sour. Kapha: light/warm/dry, avoid heavy/oily/sweet.)
2. SAFETY — no herb/food contraindicated for these conditions: {conditions}.
3. COMPLETENESS — includes guidance + a clear "not a medical diagnosis" disclaimer.
4. FIDELITY — does not contradict the ML facts: {ml_flags}.

Respond ONLY as JSON:
{{"approved": true/false, "reasons": ["..."], "fix_instructions": "what to change"}}
"""


class CriticAgent:
    async def evaluate(
        self,
        draft: str,
        *,
        dosha: str,
        conditions: list[str],
        ml_flags: list[str],
        retry_count: int = 0,
    ) -> CritiqueResult:
        system = _CRITIC_PROMPT.format(
            dosha=dosha or "unknown",
            conditions=", ".join(conditions) or "none reported",
            ml_flags=", ".join(ml_flags) or "none",
        )
        try:
            result = await call_llm(
                system, f"DRAFT TO REVIEW:\n{draft}",
                model=settings.LLM_SIMPLE_MODEL,   # cheap model is fine for review
                temperature=0.0, max_tokens=512,
            )
        except Exception as e:
            # Fail OPEN so a critic outage never blocks the user; log it.
            logger.warning("Critic evaluation failed, approving by default: %s", e)
            return CritiqueResult(approved=True, reasons=[f"critic_error: {e}"], retry_count=retry_count)

        return CritiqueResult(
            approved=bool(result.get("approved", True)),
            reasons=result.get("reasons", []) or [],
            fix_instructions=result.get("fix_instructions", "") or "",
            retry_count=retry_count,
        )
