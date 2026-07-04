"""
LLM Router — classifies prompt difficulty so we send it to the right model.

  • simple   → cheap/fast model  (greetings, follow-ups, symptom extraction)
  • complex  → smart model       (diagnosis, personalized plans)
  • critical → ensemble vote      (emergencies / safety-sensitive)

Critical is detected by keywords first (instant, free, and safe-by-default).
Everything else is classified by a single cheap LLM call.
"""

from __future__ import annotations

import logging

from agents.llm_client import call_llm_text
from app.core.config import settings

logger = logging.getLogger("dravya.llm_router")

_CRITICAL_KEYWORDS = (
    "emergency", "urgent", "severe pain", "chest pain", "bleeding",
    "suicidal", "suicide", "can't breathe", "cant breathe", "unconscious",
    "overdose", "poison",
)

_ROUTING_PROMPT = """\
Classify this query for an Ayurvedic health assistant.
Reply with exactly ONE word: simple, complex, or critical.

- simple: greetings, follow-ups, clarifications, asking about previous advice,
          short symptom descriptions.
- complex: detailed health analysis, personalized diet/herb plans,
           multi-symptom diagnosis, dosage recommendations.
- critical: emergencies, severe/acute danger, safety-sensitive situations.
"""


class LLMRouter:
    async def classify(self, prompt: str) -> str:
        low = prompt.lower()
        if any(kw in low for kw in _CRITICAL_KEYWORDS):
            logger.info("Router: critical (keyword match)")
            return "critical"

        try:
            result = await call_llm_text(
                _ROUTING_PROMPT, prompt,
                model=settings.LLM_SIMPLE_MODEL,
                temperature=0.0, max_tokens=8,
            )
            label = result.strip().lower()
            label = next((w for w in ("simple", "complex", "critical") if w in label), "complex")
        except Exception as e:
            logger.warning("Router classification failed, defaulting to complex: %s", e)
            label = "complex"

        logger.info("Router: %s", label)
        return label
