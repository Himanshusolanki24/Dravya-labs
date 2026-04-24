"""
Safety Agent — Risk Monitor & Final Validator

Checks herb–condition compatibility, flags unsafe combinations using
both LLM reasoning and the explicit Ayurvedic safety rules (Virya/Dosha aggravation
flags from the database), and adds medical disclaimer. Always runs LAST.
"""

import logging
import httpx
from agents.schemas import (
    SharedState, SafetyResult, SafetyFlag, SafetyVerdict, A2AMessage,
)
from agents.llm_client import call_llm
from app.core.config import settings

logger = logging.getLogger("dravya.agents.safety")

SYSTEM_PROMPT = """\
You are an Ayurvedic Safety Advisor and risk monitor.

You receive:
• Herb recommendations from the Dravya agent
• Hard-coded Ayurvedic safety flags from our database (DO NOT IGNORE THESE)
• Diet recommendations from the Ahara agent
• User's medical conditions and disease risk flags
• User's current medications (if any)

YOUR JOB — Final safety validation:
1. Check every recommended herb against the user's conditions AND the hard-coded database safety flags.
2. Specifically monitor Virya (potency). If a user has a Pitta condition (e.g. Acid Reflux, Ulcer), absolutely flag Ushna (hot) herbs.
3. Check herb-herb interactions and herb-food interactions.
4. Flag any item that could worsen an existing condition.
5. Assign an overall verdict: SAFE, WARNING, or HIGH_RISK.

RULES
• If the database safety flags indicate an herb aggravates a Dosha that the user is currently suffering an imbalance in, YOU MUST flag it.
• If any herb conflicts with a modern condition (e.g., blood thinners + Ashwagandha), flag it and explicitly suggest a safer alternative.
• If you assess that a condition is severe, acute, or beyond the scope of general wellness, YOU MUST explicitly advise the user to "consult a medical professional immediately".
• If verdict is HIGH_RISK, modify the herb list to remove dangerous items entirely.
• Always append a medical disclaimer emphasizing wellness guidance, not medical treatments.
• DO NOT diagnose or prescribe.

Respond ONLY in this JSON format:
{
  "verdict": "<SAFE|WARNING|HIGH_RISK>",
  "flags": [
    {
      "item": "<herb or food name>",
      "risk": "<brief risk>",
      "reason": "<explanation incorporating Virya/Dosha limits or medical interaction>"
    }
  ],
  "disclaimer": "<full medical disclaimer>",
  "modified_herbs": null or [<modified herb list if HIGH_RISK>]
}
"""


async def get_herb_safety_data(herb_name: str) -> dict:
    """Fetch hard-coded safety data for an herb directly from the microservice."""
    try:
        url = f"{settings.HERBS_MODEL_API_URL}/herbs/safety/{herb_name}"
        headers = {"X-API-Key": settings.HERBS_MODEL_API_KEY}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("found"):
                    return data
    except Exception as e:
        logger.warning(f"Failed to fetch safety info for {herb_name}: {e}")
    return {}


async def run_safety_agent(state: SharedState) -> SharedState:
    """Final safety check incorporating DB rules + LLM reasoning."""
    logger.info("Safety Agent started for user %s", state.user_profile.user_id)

    herbs = state.herbs
    diet = state.diet
    conditions = state.medical_history.conditions
    flags = state.disease_risk.overall_health_flags
    vikriti_aggravations = state.vikriti.aggravated_doshas

    herb_list = ", ".join(h.name for h in herbs.herbs) or "None"
    foods_eat = ", ".join(diet.foods_to_eat[:10]) or "None"
    foods_avoid = ", ".join(diet.foods_to_avoid[:10]) or "None"

    # Gather hard-coded safety info from microservice for each recommended herb
    safety_context = ""
    for h in herbs.herbs:
        db_safety = await get_herb_safety_data(h.name)
        if db_safety:
            safety_context += f"- **{h.name}**: "
            
            notes = db_safety.get("safety_notes", [])
            if notes:
                safety_context += " / ".join(notes) + ". "
                
            contras = db_safety.get("contraindications", "")
            if contras:
                safety_context += f"Known Contras: {contras}."
                
            safety_context += "\n"

    user_msg = (
        f"Recommended herbs: {herb_list}\n"
        f"Herb details (from Dravya Agent):\n"
    )
    for h in herbs.herbs:
        user_msg += (
            f"  - {h.name}: {h.reasoning} | "
            f"LLM contraindications: {', '.join(h.contraindications) or 'None'}\n"
        )
        
    user_msg += f"\nDATABASE STRICT SAFETY FLAGS (DO NOT IGNORE):\n{safety_context if safety_context else 'None retrieved'}\n"

    user_msg += (
        f"\nFoods to eat: {foods_eat}\n"
        f"Foods to avoid: {foods_avoid}\n\n"
        f"User Conditions: {', '.join(conditions) or 'None'}\n"
        f"User Aggravated Vikriti: {', '.join(vikriti_aggravations)}\n"
        f"Disease risk flags: {', '.join(flags) or 'None'}\n"
        f"Supplements in use: {state.diet_info.supplements or 'None'}\n"
    )

    try:
        result = await call_llm(SYSTEM_PROMPT, user_msg)

        flags_raw = result.get("flags", [])
        safety_flags = [SafetyFlag(**f) for f in flags_raw]

        verdict_str = result.get("verdict", "SAFE").upper()
        try:
            verdict = SafetyVerdict(verdict_str)
        except ValueError:
            verdict = SafetyVerdict.WARNING

        state.safety = SafetyResult(
            verdict=verdict,
            flags=safety_flags,
            disclaimer=result.get("disclaimer", SafetyResult().disclaimer),
            modified_herbs=result.get("modified_herbs"),
        )

        # If HIGH_RISK, replace herbs with the safer set
        if verdict == SafetyVerdict.HIGH_RISK and state.safety.modified_herbs:
            logger.warning("HIGH_RISK — replacing herb recommendations.")
            from agents.schemas import HerbRecommendation
            state.herbs.herbs = [
                HerbRecommendation(**h) if isinstance(h, dict) else h
                for h in state.safety.modified_herbs
            ]

    except Exception as e:
        logger.error("Safety Agent failed: %s", e)
        state.pipeline_errors.append(f"safety_agent: {e}")
        # Default to WARNING if safety agent itself fails
        state.safety = SafetyResult(verdict=SafetyVerdict.WARNING)

    state.messages.append(
        A2AMessage(
            from_agent="safety",
            to_agent="orchestrator",
            payload=state.safety.model_dump(),
        )
    )

    logger.info("Safety Agent done — verdict: %s", state.safety.verdict)
    return state
