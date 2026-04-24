"""
Dravya Intelligence Agent — Herbal AI

Uses Prakriti + Vikriti + Symptoms outputs to recommend herbs
with authentic Ayurvedic reasoning (Rasa, Guna, Virya, Vipaka, Prabhava),
generic wellness dosage guidance, and contraindication awareness.
"""

import logging
from agents.schemas import (
    SharedState, DravyaResult, HerbRecommendation, A2AMessage,
)
from agents.llm_client import call_llm
from model_clients.herbs_client import herbs_client

logger = logging.getLogger("dravya.agents.dravya_herb")

SYSTEM_PROMPT = """\
You are an expert Ayurvedic Dravyaguna (pharmacology) specialist.

You receive:
• Prakriti analysis (natural constitution)
• Vikriti analysis (current imbalance)
• ML-Recommended Ayurvedic Herbs (Ground-truth herbs to use with their Dravyaguna properties)
• Medical history and conditions

RULES
• You MUST use the exact ML-Recommended Herbs provided to you.
• Explain the Ayurvedic reasoning for each herb using its exact Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect) and Prabhava (special action).
• Show how these specific properties pacify the user's aggravated Doshas (Vikriti) without severely aggravating their dominant Prakriti Doshas.
• Provide generic wellness dosage guidance (not medical prescriptions).
• List contraindications for each herb.
• Include lifestyle tips aligned with the dosha balance.
• NEVER claim to treat, cure, or diagnose diseases.

Respond ONLY in this JSON format:
{
  "herbs": [
    {
      "name": "<common name / Latin name>",
      "sanskrit_name": "<Sanskrit name if known>",
      "reasoning": "<why this herb suits this constitution, explicitly mentioning its Rasa, Virya, and Vipaka>",
      "dosage_guidance": "<general wellness usage>",
      "contraindications": ["<condition1>", ...]
    }
  ],
  "ayurvedic_reasoning": "<overall logic of how this combination of herbs balances the Vikriti>",
  "lifestyle_tips": ["<tip1>", "<tip2>", ...]
}
"""


async def run_dravya_agent(state: SharedState) -> SharedState:
    """Recommend herbs based on Prakriti, Vikriti, using authentic Dravyaguna data."""
    logger.info("Dravya Agent started for user %s", state.user_profile.user_id)

    prakriti = state.prakriti
    vikriti = state.vikriti
    disease = state.disease_risk
    conditions = state.medical_history.conditions

    # Determine highest priority dosha to pacify based on Vikriti
    primary_aggravated_dosha = vikriti.aggravated_doshas[0] if vikriti.aggravated_doshas else prakriti.dominant_dosha

    # Let's request herbs that specifically target the primary aggravated dosha, 
    # but we'll frame the query to include both condition and dosha.
    action = "Digestive" if "Digestive" in conditions else "Wellness"
    if "Respiratory" in conditions: action = "Respiratory"
    elif "Skin" in conditions: action = "Dermatological"
    elif "Joint" in conditions or "Pain" in conditions: action = "Analgesic"

    ml_payload = {
        "prakriti": prakriti.dominant_dosha,
        "action": action,
        "top_k": 5
    }
    
    ml_herbs_context = "No specific ML herbs retrieved. Fallback to generic Ayurvedic knowledge."
    try:
        # Our updated microservice handles this query and returns Rasa, Virya, etc.
        herbs_prediction = await herbs_client.predict(ml_payload)
        
        if herbs_prediction.get("status") == "success":
            matches = herbs_prediction.get("matches", [])
            if matches:
                # Build rich context string with Dravyaguna properties
                herb_details = []
                for h in matches:
                    name = h.get("name", "")
                    rasa = h.get("rasa", "Unknown")
                    virya = h.get("virya", "Unknown")
                    vipaka = h.get("vipaka", "Unknown")
                    prabhava = h.get("prabhava", "")
                    pacifies = h.get("pacify_dosha", "")
                    
                    detail = f"- **{name}**: Rasa (Taste): {rasa}, Virya (Potency): {virya}, Vipaka: {vipaka}. Pacifies: {pacifies}. Prabhava: {prabhava}."
                    herb_details.append(detail)
                
                ml_herbs_context = (
                    f"CRITICAL REQUIREMENT - You MUST ONLY recommend these exact herbs provided by the native ML model:\n"
                    + "\n".join(herb_details)
                )
                logger.info(f"Got native ML Herbs with Dravyaguna properties: {[h.get('name') for h in matches]}")
            else:
                logger.info("ML Herbs returned success but no matches found.")
    except Exception as e:
        logger.warning(f"Failed to get native ML herbs: {e}")

    user_msg = (
        f"Prakriti: {prakriti.dominant_dosha} dominant\n"
        f"Vikriti: aggravated {', '.join(vikriti.aggravated_doshas)}, severity {vikriti.severity_score}/10\n"
        f"Health flags: {', '.join(disease.overall_health_flags) or 'None'}\n"
        f"Existing conditions: {', '.join(conditions) or 'None'}\n\n"
        f"ML-Recommended Herbs: {ml_herbs_context}\n\n"
        f"Activity level: {state.user_profile.activity_level}\n"
        f"Diet type: {state.diet_info.diet_type or 'Not specified'}\n"
    )

    try:
        result = await call_llm(SYSTEM_PROMPT, user_msg)
        herbs_raw = result.get("herbs", [])
        herbs_list = [HerbRecommendation(**h) for h in herbs_raw]
        state.herbs = DravyaResult(
            herbs=herbs_list,
            ayurvedic_reasoning=result.get("ayurvedic_reasoning", ""),
            lifestyle_tips=result.get("lifestyle_tips", []),
        )
    except Exception as e:
        logger.error("Dravya Agent failed: %s", e)
        state.pipeline_errors.append(f"dravya_agent: {e}")

    state.messages.append(
        A2AMessage(
            from_agent="dravya",
            to_agent="orchestrator",
            payload=state.herbs.model_dump(),
        )
    )

    logger.info("Dravya Agent done — %d herbs recommended", len(state.herbs.herbs))
    return state
