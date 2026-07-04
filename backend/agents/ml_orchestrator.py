"""
Models Orchestrator — 'the Scientist'.

Talks ONLY to the ML microservices. No LLM calls, no prose. It fires every
model concurrently and returns hard, structured facts (MLFacts) for the
LLM Orchestrator to communicate.

Keeping this layer pure means the ML services can be swapped freely (e.g.
PyTorch → LightGBM / ONNX) without touching the LLM side.
"""

from __future__ import annotations

import asyncio
import logging

from agents.schemas import SharedState, MLFacts
from model_clients.skin_client import skin_client
from model_clients.hair_client import hair_client
from model_clients.pcos_client import pcos_client
from model_clients.diabetes_client import diabetes_client
from model_clients.autoimmune_client import autoimmune_client
from model_clients.obesity_client import obesity_client
from model_clients.brahma_client import brahma_client
from model_clients.symptom_treatment_client import symptom_treatment_client
from model_clients.herbs_client import herbs_client
from model_clients.dietplain_client import dietplain_client

logger = logging.getLogger("dravya.ml_orchestrator")


def _questionnaire(state: SharedState) -> dict:
    p, h, d, s = state.user_profile, state.health_metrics, state.diet_info, state.symptoms_input
    return {
        "age": p.age, "gender": p.gender, "weight": p.weight, "height": p.height,
        "activity_level": p.activity_level,
        "blood_pressure": h.blood_pressure,
        "blood_sugar_fasting": h.blood_sugar_fasting,
        "blood_sugar_post_meal": h.blood_sugar_post_meal,
        "stress_level": h.stress_level, "sleep_duration": h.sleep_duration,
        "diet_type": d.diet_type, "chief_complaint": s.chief_complaint,
        "conditions": state.medical_history.conditions,
        "menstrual_cycle": s.menstrual_cycle, "hair_type": s.hair_type,
        "skin_type": s.skin_type, "weather_sensitivity": s.weather_sensitivity,
    }


async def run_ml_orchestrator(state: SharedState) -> MLFacts:
    """Run all ML microservices concurrently; return structured facts."""
    logger.info("ML Orchestrator started for user %s", state.user_profile.user_id)
    q = _questionnaire(state)
    image = {"image_url": state.images[0] if state.images else ""}

    results = await asyncio.gather(
        skin_client.predict(image),
        hair_client.predict(image),
        pcos_client.predict(q),
        diabetes_client.predict(q),
        autoimmune_client.predict(q),
        obesity_client.predict(q),
        brahma_client.predict(q),
        symptom_treatment_client.predict(q),
        herbs_client.predict({**q, "top_k": 5}),
        dietplain_client.predict(q),
        return_exceptions=True,
    )

    def safe(i: int) -> dict:
        r = results[i]
        if isinstance(r, Exception):
            logger.warning("ML client %d failed: %s", i, r)
            return {"status": "error", "reason": str(r)}
        return r

    facts = MLFacts(
        skin=safe(0), hair=safe(1), pcos=safe(2), diabetes=safe(3),
        autoimmune=safe(4), obesity=safe(5), brahma=safe(6),
        symptom_treatment=safe(7), herbs=safe(8), dietplain=safe(9),
    )

    # Dominant dosha from Brahma model (falls back to prakriti agent if present)
    if facts.brahma.get("status") == "success":
        facts.dominant_dosha = (
            facts.brahma.get("primary_dosha")
            or facts.brahma.get("dominant_dosha")
            or state.prakriti.dominant_dosha
            or "unknown"
        )
    else:
        facts.dominant_dosha = state.prakriti.dominant_dosha or "unknown"

    # Risk flags
    for name, res in [
        ("skin", facts.skin), ("hair", facts.hair), ("pcos", facts.pcos),
        ("diabetes", facts.diabetes), ("autoimmune", facts.autoimmune),
        ("obesity", facts.obesity), ("ayurvedic_disease", facts.symptom_treatment),
    ]:
        if res.get("status") == "success":
            risk = (res.get("risk_level") or res.get("risk") or "").lower()
            if risk in ("moderate", "high", "critical"):
                facts.health_flags.append(f"{name}_risk:{risk}")

    facts.errors = [f"{k}:{v.get('reason')}" for k, v in {
        "skin": facts.skin, "hair": facts.hair, "pcos": facts.pcos,
        "diabetes": facts.diabetes, "autoimmune": facts.autoimmune,
        "obesity": facts.obesity, "brahma": facts.brahma,
        "symptom_treatment": facts.symptom_treatment,
        "herbs": facts.herbs, "dietplain": facts.dietplain,
    }.items() if v.get("status") == "error"]

    logger.info("ML Orchestrator done — dosha=%s, %d flags, %d errors",
                facts.dominant_dosha, len(facts.health_flags), len(facts.errors))
    return facts
