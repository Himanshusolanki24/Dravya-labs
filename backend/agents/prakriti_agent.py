"""
Prakriti Agent — Body Constitution Analyzer

Determines Vata / Pitta / Kapha constitution percentages
from long-term physical and psychological traits.
"""

import logging
from agents.schemas import SharedState, PrakritiResult, A2AMessage
from agents.llm_client import call_llm

logger = logging.getLogger("dravya.agents.prakriti")

SYSTEM_PROMPT = """\
You are an Ayurvedic expert specializing in determining Prakriti (natural body constitution).

RULES
• Analyze LONG-TERM traits — body frame, skin type, appetite, temperament, etc.
• Do NOT use temporary symptoms (those belong to Vikriti).
• Return Vata, Pitta, Kapha percentages that sum to 100.
• Provide dominant and secondary dosha.
• Give a confidence score (0-1) based on how much data you received.

Respond ONLY in this JSON format:
{
  "vata_percentage": <float>,
  "pitta_percentage": <float>,
  "kapha_percentage": <float>,
  "dominant_dosha": "<vata|pitta|kapha>",
  "secondary_dosha": "<vata|pitta|kapha|null>",
  "explanation": "<2-3 sentence Ayurvedic reasoning>",
  "confidence": <float 0-1>
}
"""


async def run_prakriti_agent(state: SharedState) -> SharedState:
    """Analyze user traits and determine Prakriti constitution."""
    logger.info("Prakriti Agent started for user %s", state.user_profile.user_id)

    profile = state.user_profile
    symptoms = state.symptoms_input
    memory = state.memory_context

    # Get Brahma ML model dosha classification (set by Symptoms Agent)
    brahma = state.disease_risk.brahma_dosha or {}
    brahma_dosha = brahma.get("primary_dosha", "")

    user_msg = (
        f"Long-term profile:\n"
        f"- Age: {profile.age}, Gender: {profile.gender}\n"
        f"- Height: {profile.height} cm, Weight: {profile.weight} kg\n"
        f"- Activity level: {profile.activity_level}\n"
        f"- Body frame: {symptoms.body_frame}\n"
        f"- Skin type: {symptoms.skin_type}\n"
        f"- Hair type: {symptoms.hair_type}\n"
        f"- Energy pattern: {symptoms.energy_pattern}\n"
        f"- Appetite: {symptoms.appetite}\n"
        f"- Elimination: {symptoms.elimination}\n"
        f"- Sleep pattern: {symptoms.sleep_pattern}\n"
        f"- Weather sensitivity: {symptoms.weather_sensitivity}\n"
        f"- Stress response: {symptoms.stress_response}\n"
        f"- Memory/Focus: {symptoms.memory_focus}\n"
        f"- Temperament: {symptoms.temperament}\n"
    )

    # Inject Brahma ML classification as strong context
    if brahma_dosha:
        user_msg += (
            f"\nIMPORTANT — Our ML Prakriti model has classified this user as: {brahma_dosha}.\n"
            f"Use this as a strong signal when determining the dominant dosha.\n"
        )

    if memory.get("past_prakriti"):
        user_msg += f"\nPrevious Prakriti assessment: {memory['past_prakriti']}\n"

    try:
        result = await call_llm(SYSTEM_PROMPT, user_msg)
        state.prakriti = PrakritiResult(**result)
    except Exception as e:
        logger.error("Prakriti Agent failed: %s", e)
        state.pipeline_errors.append(f"prakriti_agent: {e}")

    # Fallback: if LLM still returned no dominant_dosha, use the Brahma ML result
    if not state.prakriti.dominant_dosha or state.prakriti.dominant_dosha == "unknown":
        if brahma_dosha:
            # Extract first dosha from ML result (e.g. "Vata+Pitta" → "Vata")
            first_dosha = brahma_dosha.split("+")[0].strip().capitalize()
            state.prakriti.dominant_dosha = first_dosha
            logger.info("Prakriti fallback to Brahma ML dosha: %s", first_dosha)

    state.messages.append(
        A2AMessage(
            from_agent="prakriti",
            to_agent="orchestrator",
            payload=state.prakriti.model_dump(),
        )
    )

    logger.info("Prakriti Agent done — dominant: %s", state.prakriti.dominant_dosha)
    return state
