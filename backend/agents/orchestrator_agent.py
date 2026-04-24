"""
Orchestrator Agent — LangGraph State Graph Pipeline

Pipeline:
  Memory Retrieval → Symptoms → Prakriti → Vikriti →
  Dravya (Herbs) → Ahara (Diet) → Safety → Memory Save → Response

Features:
  • A2A message bus via SharedState.messages
  • Per-node error handling (pipeline continues on non-fatal errors)
  • Structured logging
  • Returns GeneratePlanResponse
"""

import logging
from datetime import datetime
from typing import Any

from langgraph.graph import StateGraph, END

from agents.schemas import SharedState, GeneratePlanResponse
from agents.prakriti_agent import run_prakriti_agent
from agents.vikriti_agent import run_vikriti_agent
from agents.symptoms_agent import run_symptoms_agent
from agents.dravya_herb_agent import run_dravya_agent
from agents.ahara_agent import run_ahara_agent
from agents.safety_agent import run_safety_agent
from agents.llm_client import call_llm
from memory.health_memory_manager import retrieve_health_context, save_consultation

logger = logging.getLogger("dravya.orchestrator")

# ═══════════════════════════════════════════════════════════════
# ORCHESTRATOR SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════

ORCHESTRATOR_PROMPT = """\
You are the Master Orchestrator Agent for Dravya Health.

You have access to:
• The user's health profile (age, gender, height, weight, activity level)
• The user's health metrics (blood pressure, blood sugar, cholesterol, heart rate, sleep, stress)
• The user's diet information (diet type, allergies, supplements)
• The user's medical history (existing conditions, injuries, surgeries)
• The user's Pinecone medical history (memories & previous consultations)
• Prakriti (Dosha constitution) & Vikriti (Current Imbalance)
• Disease Risk assessments (from ML models)
• Ayurvedic Herbs recommended (grounded from ML models)
• Ahara (Diet) guidance (grounded from ML models)
• Safety validations & warnings

YOUR JOB:
1. Systematically synthesize ALL outputs into a single, cohesive, personalized Master Health Plan.
2. Reference the user's actual health data (BMI, blood pressure, conditions, etc.) to make recommendations specific to them.
3. Structure your output clearly using markdown headers:
   - Profile & Constitution (User profile summary + Prakriti insight)
   - Current Health Snapshot (Health metrics interpretation + Vikriti + ML Flags)
   - Pinecone Historical Context (if previous memories exist, mention how the state evolved)
   - Herbal Protocol (List the strict ML herbs safely approved, considering user's conditions & allergies)
   - Home Remedies (Simple, safe remedies based on the user's symptoms and dosha)
   - Dietary Plan (Ahara recommendations personalized to user's diet type and allergies)
   - Lifestyle Recommendations (Based on activity level, stress, sleep data)
   - Final Safety Mandate (Emphasize the safety agent's verdict and disclaimer)
4. Ensure the tone is empathetic, professional, and strictly adheres to Ayurvedic wellness, while being fully transparent about NOT being a medical doctor.

Respond ONLY in this exact JSON format:
{
  "summary": "<Your comprehensive Markdown-formatted synthesis here>"
}
"""

# ═══════════════════════════════════════════════════════════════
# NODE WRAPPERS — each wraps an agent with error handling
# ═══════════════════════════════════════════════════════════════

async def node_memory_retrieve(state: dict[str, Any]) -> dict[str, Any]:
    """Fetch Supabase profile + Pinecone memories."""
    s = SharedState(**state)
    s.started_at = datetime.utcnow().isoformat()
    logger.info("Pipeline started for user %s", s.user_profile.user_id)

    try:
        ctx = await retrieve_health_context(s.user_profile.user_id)
        s.memory_context = ctx
    except Exception as e:
        logger.warning("Memory retrieval failed (non-fatal): %s", e)
        s.pipeline_errors.append(f"memory_retrieve: {e}")

    return s.model_dump()


async def node_symptoms(state: dict[str, Any]) -> dict[str, Any]:
    """Run Symptoms Agent (ML model calls)."""
    s = SharedState(**state)
    try:
        s = await run_symptoms_agent(s)
    except Exception as e:
        logger.error("Symptoms node failed: %s", e)
        s.pipeline_errors.append(f"symptoms_node: {e}")
    return s.model_dump()


async def node_prakriti(state: dict[str, Any]) -> dict[str, Any]:
    """Run Prakriti Agent (constitution analysis)."""
    s = SharedState(**state)
    try:
        s = await run_prakriti_agent(s)
    except Exception as e:
        logger.error("Prakriti node failed: %s", e)
        s.pipeline_errors.append(f"prakriti_node: {e}")
    return s.model_dump()


async def node_vikriti(state: dict[str, Any]) -> dict[str, Any]:
    """Run Vikriti Agent (imbalance detection)."""
    s = SharedState(**state)
    try:
        s = await run_vikriti_agent(s)
    except Exception as e:
        logger.error("Vikriti node failed: %s", e)
        s.pipeline_errors.append(f"vikriti_node: {e}")
    return s.model_dump()


async def node_dravya(state: dict[str, Any]) -> dict[str, Any]:
    """Run Dravya Agent (herbal recommendations)."""
    s = SharedState(**state)
    try:
        s = await run_dravya_agent(s)
    except Exception as e:
        logger.error("Dravya node failed: %s", e)
        s.pipeline_errors.append(f"dravya_node: {e}")
    return s.model_dump()


async def node_ahara(state: dict[str, Any]) -> dict[str, Any]:
    """Run Ahara Agent (diet recommendations)."""
    s = SharedState(**state)
    try:
        s = await run_ahara_agent(s)
    except Exception as e:
        logger.error("Ahara node failed: %s", e)
        s.pipeline_errors.append(f"ahara_node: {e}")
    return s.model_dump()


async def node_safety(state: dict[str, Any]) -> dict[str, Any]:
    """Run Safety Agent (final validation)."""
    s = SharedState(**state)
    try:
        s = await run_safety_agent(s)
    except Exception as e:
        logger.error("Safety node failed: %s", e)
        s.pipeline_errors.append(f"safety_node: {e}")
    return s.model_dump()


async def node_synthesize(state: dict[str, Any]) -> dict[str, Any]:
    """Run Master Orchestrator Agent to formulate the final narrative."""
    s = SharedState(**state)
    logger.info("Orchestrator Synthesis Agent started for user %s", s.user_profile.user_id)
    
    # Safely summarize Pinecone memories
    memories = s.memory_context.get("memories", [])
    memory_context_str = "No past history found."
    if memories:
        memory_context_str = "\n".join([f"• {m.get('text', '')}" for m in memories])

    user_msg = (
        f"USER ID: {s.user_profile.user_id}\n\n"
        f"--- USER PROFILE ---\n"
        f"Age: {s.user_profile.age}, Gender: {s.user_profile.gender}, "
        f"Height: {s.user_profile.height} cm, Weight: {s.user_profile.weight} kg, "
        f"Activity Level: {s.user_profile.activity_level}\n\n"
        f"--- HEALTH METRICS ---\n{s.health_metrics.model_dump_json(indent=2)}\n\n"
        f"--- DIET INFO ---\n{s.diet_info.model_dump_json(indent=2)}\n\n"
        f"--- MEDICAL HISTORY ---\n{s.medical_history.model_dump_json(indent=2)}\n\n"
        f"--- PINECONE MEDICAL HISTORY ---\n{memory_context_str}\n\n"
        f"--- PRAKRITI ---\n{s.prakriti.model_dump_json(indent=2)}\n\n"
        f"--- VIKRITI ---\n{s.vikriti.model_dump_json(indent=2)}\n\n"
        f"--- DISEASE RISK ---\n{s.disease_risk.model_dump_json(indent=2)}\n\n"
        f"--- HERBS ---\n{s.herbs.model_dump_json(indent=2)}\n\n"
        f"--- AHARA (DIET) ---\n{s.diet.model_dump_json(indent=2)}\n\n"
        f"--- SAFETY VERDICT ---\n{s.safety.model_dump_json(indent=2)}\n"
    )

    try:
        result = await call_llm(ORCHESTRATOR_PROMPT, user_msg)
        s.orchestrator_summary = result.get("summary", result.get("raw_response", ""))
    except Exception as e:
        logger.error("Synthesis node failed: %s", e)
        s.pipeline_errors.append(f"synthesis_node: {e}")
        
    return s.model_dump()


async def node_memory_save(state: dict[str, Any]) -> dict[str, Any]:
    """Persist results to Supabase + Pinecone."""
    s = SharedState(**state)
    s.completed_at = datetime.utcnow().isoformat()

    report = {
        "prakriti": s.prakriti.model_dump(),
        "vikriti": s.vikriti.model_dump(),
        "disease_risk": s.disease_risk.model_dump(),
        "herbs": s.herbs.model_dump(),
        "diet": s.diet.model_dump(),
        "safety": s.safety.model_dump(),
        "pipeline_errors": s.pipeline_errors,
    }

    try:
        await save_consultation(s.user_profile.user_id, report)
    except Exception as e:
        logger.warning("Memory save failed (non-fatal): %s", e)
        s.pipeline_errors.append(f"memory_save: {e}")

    logger.info("Pipeline complete for user %s", s.user_profile.user_id)
    return s.model_dump()


# ═══════════════════════════════════════════════════════════════
# BUILD THE GRAPH
# ═══════════════════════════════════════════════════════════════

def _build_graph() -> StateGraph:
    """
    Construct LangGraph StateGraph with linear pipeline:
    memory_retrieve → symptoms → prakriti → vikriti →
    dravya → ahara → safety → memory_save → END
    """
    g = StateGraph(dict)

    g.add_node("memory_retrieve", node_memory_retrieve)
    g.add_node("symptoms", node_symptoms)
    g.add_node("prakriti", node_prakriti)
    g.add_node("vikriti", node_vikriti)
    g.add_node("dravya", node_dravya)
    g.add_node("ahara", node_ahara)
    g.add_node("safety", node_safety)
    g.add_node("synthesize", node_synthesize)
    g.add_node("memory_save", node_memory_save)

    g.set_entry_point("memory_retrieve")
    g.add_edge("memory_retrieve", "symptoms")
    g.add_edge("symptoms", "prakriti")
    g.add_edge("prakriti", "vikriti")
    g.add_edge("vikriti", "dravya")
    g.add_edge("dravya", "ahara")
    g.add_edge("ahara", "safety")
    g.add_edge("safety", "synthesize")
    g.add_edge("synthesize", "memory_save")
    g.add_edge("memory_save", END)

    return g


# Compiled graph — singleton
_compiled_graph = None


def _get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = _build_graph().compile()
    return _compiled_graph


# ═══════════════════════════════════════════════════════════════
# PUBLIC API
# ═══════════════════════════════════════════════════════════════

async def run_pipeline(state: SharedState) -> GeneratePlanResponse:
    """
    Execute the full multi-agent pipeline.

    Returns a structured GeneratePlanResponse.
    """
    graph = _get_graph()

    # Run the graph
    final_state_dict = await graph.ainvoke(state.model_dump())

    final = SharedState(**final_state_dict)

    return GeneratePlanResponse(
        status="success",
        prakriti=final.prakriti,
        vikriti=final.vikriti,
        disease_risk=final.disease_risk,
        herbs=final.herbs,
        diet=final.diet,
        safety=final.safety,
        orchestrator_summary=final.orchestrator_summary,
        pipeline_errors=final.pipeline_errors,
    )
