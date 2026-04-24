"""
Ahara Agent — Diet Intelligence

Generates personalized dietary guidance: foods to eat/avoid,
meal patterns, and seasonal alignment based on dosha balance.
"""

import logging
from agents.schemas import (
    SharedState, AharaResult, MealRecommendation, A2AMessage,
)
from agents.llm_client import call_llm
from model_clients.dietplain_client import dietplain_client

logger = logging.getLogger("dravya.agents.ahara")

SYSTEM_PROMPT = """\
You are an Ayurvedic Ahara (nutrition) specialist.

RULES
• You MUST use the exact ML-Calculated Diet Options provided to formulate your meal pattern.
• Align recommendations with the current season and climate.
• Consider food allergies and existing conditions.
• Provide reasoning based on Rasa (taste), Guna (qualities), Virya (potency).
• NEVER prescribe specific medical diets — wellness guidance only.

Respond ONLY in this JSON format:
{
  "foods_to_eat": ["<food1>", ...],
  "foods_to_avoid": ["<food1>", ...],
  "meal_pattern": [
    {"meal_type": "breakfast", "suggestions": ["<item>", ...]},
    {"meal_type": "lunch", "suggestions": ["<item>", ...]},
    {"meal_type": "dinner", "suggestions": ["<item>", ...]},
    {"meal_type": "snack", "suggestions": ["<item>", ...]}
  ],
  "seasonal_alignment": "<seasonal guidance>",
  "dietary_reasoning": "<Ayurvedic reasoning>"
}
"""


async def run_ahara_agent(state: SharedState) -> SharedState:
    """Generate personalized dietary recommendations."""
    logger.info("Ahara Agent started for user %s", state.user_profile.user_id)

    prakriti = state.prakriti
    vikriti = state.vikriti
    diet_info = state.diet_info
    profile = state.user_profile

    # 1. First, get ground-truth nutritional items from our dedicated PyTorch ML model
    ml_payload = {
        "meal_type": "Lunch", # Defaulting bulk macros for now
        "calories": 600.0,
        "protein": 30.0,
        "carbs": 50.0,
        "fat": 20.0,
        "fiber": 8.0,
        "sugars": 5.0,
        "sodium": 300.0,
        "cholesterol": 10.0,
        "water_intake": 1.5,
        "top_k": 8
    }
    
    ml_diet_context = "No specific ML foods retrieved. Fallback to LLM knowledge."
    try:
        diet_prediction = await dietplain_client.predict(ml_payload)
        if diet_prediction.get("status") == "success":
            # Microservice uses 'food_name', not 'food_item'
            names = [m.get("food_name") for m in diet_prediction.get("matches", []) if m.get("food_name")]
            if names:
                ml_diet_context = f"CRITICAL REQUIREMENT - Structure your Meal Pattern using natively calculated ML foods: {', '.join(names)}"
                logger.info(f"Got native ML Diet items: {names}")
            else:
                logger.info("ML Diet returned success but no food names found.")
    except Exception as e:
        logger.warning(f"Failed to get native ML diet items: {e}")

    user_msg = (
        f"Prakriti: {prakriti.dominant_dosha}\n"
        f"Aggravated doshas: {', '.join(vikriti.aggravated_doshas)}\n"
        f"Allergies: {diet_info.food_allergies or 'None'}\n\n"
        f"ML-Calculated Diet Options: {ml_diet_context}\n\n"
        f"Location: {profile.location or 'Not specified'}\n"
        f"Health flags: {', '.join(state.disease_risk.overall_health_flags) or 'None'}\n"
    )

    try:
        result = await call_llm(SYSTEM_PROMPT, user_msg)
        meals_raw = result.get("meal_pattern", [])
        meals = [MealRecommendation(**m) for m in meals_raw]
        state.diet = AharaResult(
            foods_to_eat=result.get("foods_to_eat", []),
            foods_to_avoid=result.get("foods_to_avoid", []),
            meal_pattern=meals,
            seasonal_alignment=result.get("seasonal_alignment", ""),
            dietary_reasoning=result.get("dietary_reasoning", ""),
        )
    except Exception as e:
        logger.error("Ahara Agent failed: %s", e)
        state.pipeline_errors.append(f"ahara_agent: {e}")

    state.messages.append(
        A2AMessage(
            from_agent="ahara",
            to_agent="orchestrator",
            payload=state.diet.model_dump(),
        )
    )

    logger.info("Ahara Agent done — %d foods to eat", len(state.diet.foods_to_eat))
    return state
