"""
Symptoms Agent — Disease Detection via External ML APIs

Calls 6 pre-hosted ML models (skin, hair, PCOS, diabetes,
autoimmune, obesity) and aggregates their responses.
"""

import asyncio
import logging
from agents.schemas import SharedState, SymptomsResult, A2AMessage
from model_clients.skin_client import skin_client
from model_clients.hair_client import hair_client
from model_clients.pcos_client import pcos_client
from model_clients.pcos_client import pcos_client
from model_clients.autoimmune_client import autoimmune_client
from model_clients.obesity_client import obesity_client
from model_clients.brahma_client import brahma_client
from model_clients.symptom_treatment_client import symptom_treatment_client

logger = logging.getLogger("dravya.agents.symptoms")


async def run_symptoms_agent(state: SharedState) -> SharedState:
    """Call all 6 ML model APIs concurrently and aggregate results."""
    logger.info("Symptoms Agent started for user %s", state.user_profile.user_id)

    profile = state.user_profile
    symptoms = state.symptoms_input
    health = state.health_metrics
    diet = state.diet_info
    conditions = state.medical_history.conditions

    # Build shared questionnaire data
    questionnaire = {
        "age": profile.age,
        "gender": profile.gender,
        "weight": profile.weight,
        "height": profile.height,
        "activity_level": profile.activity_level,
        "blood_pressure": health.blood_pressure,
        "blood_sugar_fasting": health.blood_sugar_fasting,
        "blood_sugar_post_meal": health.blood_sugar_post_meal,
        "stress_level": health.stress_level,
        "sleep_duration": health.sleep_duration,
        "sleep_pattern": symptoms.sleep_pattern,
        "diet_type": diet.diet_type,
        "chief_complaint": symptoms.chief_complaint,
        "conditions": conditions,
        "menstrual_cycle": symptoms.menstrual_cycle,
        "hair_type": symptoms.hair_type,
        "skin_type": symptoms.skin_type,
        "weather_sensitivity": symptoms.weather_sensitivity,
    }

    # Image data for vision models
    image_data = {"image_url": state.images[0] if state.images else ""}

    # ── Fire all model calls concurrently ─────────────────
    results = await asyncio.gather(
        skin_client.predict(image_data),
        hair_client.predict(image_data),
        pcos_client.predict(questionnaire),
        diabetes_client.predict(questionnaire),
        autoimmune_client.predict(questionnaire),
        obesity_client.predict(questionnaire),
        brahma_client.predict(questionnaire),
        symptom_treatment_client.predict(questionnaire),
        return_exceptions=True,
    )

    def _safe(idx: int) -> dict:
        r = results[idx]
        if isinstance(r, Exception):
            logger.warning("Model client %d raised: %s", idx, r)
            return {"status": "error", "reason": str(r)}
        return r

    # ── Aggregate ─────────────────────────────────────────
    skin = _safe(0)
    hair = _safe(1)
    pcos = _safe(2)
    diabetes = _safe(3)
    autoimmune = _safe(4)
    obesity = _safe(5)
    brahma = _safe(6)
    symptom_treatment = _safe(7)

    # In case the core prakriti agent missed the dosha or we want to cross-verify:
    if brahma.get("status") == "success" and "primary_dosha" in brahma:
        logger.info(f"Brahma Model classifies user as {brahma['primary_dosha']}")
        # Note: We are attaching Brahma inference to disease risk for overall comprehensive review 
        # (Could also overwrite state.prakriti if orchestrator allows)

    # Build health flags
    flags: list[str] = []
    for name, res in [
        ("skin", skin), ("hair", hair), ("pcos", pcos),
        ("diabetes", diabetes), ("autoimmune", autoimmune), 
        ("obesity", obesity), ("ayurvedic_disease", symptom_treatment)
    ]:
        if res.get("status") == "success":
            risk = res.get("risk_level") or res.get("risk", "")
            if risk and risk.lower() in ("moderate", "high", "critical"):
                flags.append(f"{name}_risk:{risk}")

    state.disease_risk = SymptomsResult(
        skin_conditions=skin,
        hair_conditions=hair,
        pcos_risk=pcos,
        diabetes_risk=diabetes,
        autoimmune_risk=autoimmune,
        obesity_risk=obesity,
        brahma_dosha=brahma, # Stash brahma ML object
        symptom_treatment_risk=symptom_treatment,
        overall_health_flags=flags,
    )

    state.messages.append(
        A2AMessage(
            from_agent="symptoms",
            to_agent="orchestrator",
            payload=state.disease_risk.model_dump(),
        )
    )

    logger.info(
        "Symptoms Agent done — %d flags raised", len(flags)
    )
    return state
