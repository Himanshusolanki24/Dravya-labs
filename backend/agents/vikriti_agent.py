"""
Vikriti Agent — Current Dosha Imbalance Detector

Analyzes PRESENT symptoms to detect aggravated doshas,
classify acute vs chronic, and assign severity.
"""

import logging
from agents.schemas import SharedState, VikritiResult, A2AMessage
from agents.llm_client import call_llm

logger = logging.getLogger("dravya.agents.vikriti")

SYSTEM_PROMPT = """\
You are an Ayurvedic physician specializing in Vikriti — detecting current dosha imbalance.

RULES
• Focus on PRESENT symptoms, recent complaints, and current lifestyle.
• Compare against the user's Prakriti (natural constitution) to identify deviations.
• Classify the imbalance as "acute", "chronic", or "mixed".
• Assign a severity score from 0 (no imbalance) to 10 (severe imbalance).
• List which doshas are currently aggravated.

Respond ONLY in this JSON format:
{
  "aggravated_doshas": ["<dosha1>", ...],
  "classification": "<acute|chronic|mixed>",
  "severity_score": <float 0-10>,
  "imbalance_explanation": "<Ayurvedic reasoning>",
  "recommendations_summary": "<brief summary of balancing approach>"
}
"""


async def run_vikriti_agent(state: SharedState) -> SharedState:
    """Detect current dosha imbalance from symptoms and health metrics."""
    logger.info("Vikriti Agent started for user %s", state.user_profile.user_id)

    symptoms = state.symptoms_input
    health = state.health_metrics
    prakriti = state.prakriti

    user_msg = (
        f"Natural constitution (Prakriti): {prakriti.dominant_dosha} dominant "
        f"(V:{prakriti.vata_percentage}% P:{prakriti.pitta_percentage}% K:{prakriti.kapha_percentage}%)\n\n"
        f"Current symptoms:\n"
        f"- Chief complaint: {symptoms.chief_complaint}\n"
        f"- Description: {symptoms.description}\n"
        f"- Duration: {symptoms.duration}\n"
        f"- Severity self-assessment: {symptoms.severity}\n\n"
        f"Current health metrics:\n"
        f"- Blood pressure: {health.blood_pressure}\n"
        f"- Blood sugar (fasting): {health.blood_sugar_fasting}\n"
        f"- Stress level: {health.stress_level}/10\n"
        f"- Sleep: {health.sleep_duration}\n"
        f"- Heart rate: {health.heart_rate}\n\n"
        f"Medical conditions: {', '.join(state.medical_history.conditions) or 'None reported'}\n"
    )

    try:
        result = await call_llm(SYSTEM_PROMPT, user_msg)
        state.vikriti = VikritiResult(**result)
    except Exception as e:
        logger.error("Vikriti Agent failed: %s", e)
        state.pipeline_errors.append(f"vikriti_agent: {e}")

    state.messages.append(
        A2AMessage(
            from_agent="vikriti",
            to_agent="orchestrator",
            payload=state.vikriti.model_dump(),
        )
    )

    logger.info("Vikriti Agent done — severity: %s", state.vikriti.severity_score)
    return state
