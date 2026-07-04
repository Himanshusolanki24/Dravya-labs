"""
LLM Orchestrator — 'the Communicator / Doctor'.

Turns the Scientist's hard facts (MLFacts) into human-readable Ayurvedic
advice. Combines all three requested features:

  • Multi-LLM routing   → LLMRouter picks simple / complex / critical
  • Ensemble voting     → critical prompts get LLMEnsemble.vote()
  • Loop engineering    → CriticAgent reviews each draft; on rejection we
                          regenerate with its fix instructions (max retries).

It also injects Dynamic Few-Shot examples from the Data Flywheel (past 👍
answers for the same dosha), so quality improves before any fine-tuning.
"""

from __future__ import annotations

import logging

from agents.schemas import SharedState, MLFacts, LLMResponse, CritiqueResult
from agents.llm_router import LLMRouter
from agents.llm_ensemble import LLMEnsemble
from agents.critic_agent import CriticAgent
from agents.llm_client import call_llm_text
from app.core.config import settings

logger = logging.getLogger("dravya.llm_orchestrator")

_SYNTHESIS_PROMPT = """\
You are the Communicator for Dravya Health — an empathetic Ayurvedic wellness
assistant. Turn the structured facts below into a clear, personalized plan.

Structure with markdown headers: Constitution • Current Snapshot • Herbal
Protocol • Dietary Plan • Lifestyle • Safety. Ground every recommendation in
the ML facts. You are NOT a medical doctor — always include a disclaimer, and
advise professional consultation when risk flags are present.
{few_shot}
{critique_feedback}
"""


class LLMOrchestrator:
    def __init__(self) -> None:
        self.router = LLMRouter()
        self.ensemble = LLMEnsemble()
        self.critic = CriticAgent()

    def _context(self, state: SharedState, facts: MLFacts) -> str:
        return (
            f"USER: age={state.user_profile.age}, gender={state.user_profile.gender}\n"
            f"DOMINANT DOSHA: {facts.dominant_dosha}\n"
            f"CONDITIONS: {', '.join(state.medical_history.conditions) or 'none'}\n"
            f"RISK FLAGS: {', '.join(facts.health_flags) or 'none'}\n"
            f"HERBS (ML): {facts.herbs}\n"
            f"DIET (ML): {facts.dietplain}\n"
            f"DISEASE MODELS: pcos={facts.pcos.get('risk_level')}, "
            f"diabetes={facts.diabetes.get('risk_level')}, "
            f"autoimmune={facts.autoimmune.get('risk_level')}, "
            f"obesity={facts.obesity.get('risk_level')}\n"
        )

    async def generate(
        self, state: SharedState, facts: MLFacts, few_shot: str = "",
    ) -> tuple[LLMResponse, CritiqueResult]:
        context = self._context(state, facts)
        route = await self.router.classify(
            state.symptoms_input.chief_complaint or context
        )

        critique = CritiqueResult()
        model_used = "unknown"
        draft = ""
        feedback = ""

        for attempt in range(1, settings.MAX_CRITIC_RETRIES + 1):
            system = _SYNTHESIS_PROMPT.format(few_shot=few_shot, critique_feedback=feedback)

            if route == "critical":
                draft, model_used = await self.ensemble.vote(system, context)
            else:
                model_used = settings.LLM_COMPLEX_MODEL if route == "complex" else settings.LLM_SIMPLE_MODEL
                draft = await call_llm_text(system, context, model=model_used)

            critique = await self.critic.evaluate(
                draft,
                dosha=facts.dominant_dosha,
                conditions=state.medical_history.conditions,
                ml_flags=facts.health_flags,
                retry_count=attempt - 1,
            )

            if critique.approved:
                logger.info("LLM Orchestrator approved on attempt %d (route=%s, model=%s)",
                            attempt, route, model_used)
                break

            logger.info("Critic rejected attempt %d/%d: %s",
                        attempt, settings.MAX_CRITIC_RETRIES, critique.reasons)
            feedback = (
                "\nPREVIOUS DRAFT WAS REJECTED. Fix these issues:\n"
                f"{critique.fix_instructions}\n"
            )

        return (
            LLMResponse(text=draft, model_used=model_used, route=route, attempts=critique.retry_count + 1),
            critique,
        )
