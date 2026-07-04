"""
Main Orchestrator — 'the Chief Medical Officer' (Supervisor pattern).

Hierarchical graph:

    memory_retrieve → ml_orchestrator (Scientist) → llm_orchestrator (Communicator,
    with internal router + critic loop) → memory_save

This replaces the linear 9-node pipeline when
settings.USE_HIERARCHICAL_ORCHESTRATOR is true. It is additive — the old
pipeline stays intact and is used by default.

It also records `orchestrator_logs` (which models fired, the route taken, the
critic verdict) — exactly the context the Data Flywheel stores with feedback.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from langgraph.graph import StateGraph, END

from agents.schemas import SharedState, GeneratePlanResponse
from agents.ml_orchestrator import run_ml_orchestrator
from agents.llm_orchestrator import LLMOrchestrator
from memory.health_memory_manager import retrieve_health_context, save_consultation

logger = logging.getLogger("dravya.hierarchical")

_llm_orchestrator = LLMOrchestrator()


async def node_memory_retrieve(state: dict[str, Any]) -> dict[str, Any]:
    s = SharedState(**state)
    s.started_at = datetime.utcnow().isoformat()
    try:
        s.memory_context = await retrieve_health_context(s.user_profile.user_id)
    except Exception as e:
        logger.warning("Memory retrieve failed (non-fatal): %s", e)
        s.pipeline_errors.append(f"memory_retrieve: {e}")
    return s.model_dump()


async def node_ml_orchestrator(state: dict[str, Any]) -> dict[str, Any]:
    s = SharedState(**state)
    try:
        s.ml_facts = await run_ml_orchestrator(s)
        s.pipeline_errors.extend(s.ml_facts.errors)
    except Exception as e:
        logger.error("ML orchestrator failed: %s", e)
        s.pipeline_errors.append(f"ml_orchestrator: {e}")
    return s.model_dump()


async def node_llm_orchestrator(state: dict[str, Any]) -> dict[str, Any]:
    s = SharedState(**state)

    # Data Flywheel: inject highly-rated past answers for this dosha
    few_shot = ""
    try:
        from app.services.few_shot_retriever import get_few_shot_examples
        few_shot = await get_few_shot_examples(
            s.symptoms_input.chief_complaint or "", s.ml_facts.dominant_dosha
        )
    except Exception as e:
        logger.warning("Few-shot fetch failed (non-fatal): %s", e)

    try:
        response, critique = await _llm_orchestrator.generate(s, s.ml_facts, few_shot=few_shot)
        s.llm_response = response
        s.critique = critique
        s.orchestrator_summary = response.text
    except Exception as e:
        logger.error("LLM orchestrator failed: %s", e)
        s.pipeline_errors.append(f"llm_orchestrator: {e}")

    # Record the logs the feedback table will store
    s.orchestrator_logs = {
        "route": s.llm_response.route,
        "model_used": s.llm_response.model_used,
        "attempts": s.llm_response.attempts,
        "critic_approved": s.critique.approved,
        "critic_reasons": s.critique.reasons,
        "dominant_dosha": s.ml_facts.dominant_dosha,
        "health_flags": s.ml_facts.health_flags,
        "ml_errors": s.ml_facts.errors,
    }
    return s.model_dump()


async def node_memory_save(state: dict[str, Any]) -> dict[str, Any]:
    s = SharedState(**state)
    s.completed_at = datetime.utcnow().isoformat()
    try:
        await save_consultation(s.user_profile.user_id, {
            "summary": s.orchestrator_summary,
            "orchestrator_logs": s.orchestrator_logs,
            "pipeline_errors": s.pipeline_errors,
        })
    except Exception as e:
        logger.warning("Memory save failed (non-fatal): %s", e)
        s.pipeline_errors.append(f"memory_save: {e}")
    return s.model_dump()


def _build_graph() -> StateGraph:
    g = StateGraph(dict)
    g.add_node("memory_retrieve", node_memory_retrieve)
    g.add_node("ml_orchestrator", node_ml_orchestrator)
    g.add_node("llm_orchestrator", node_llm_orchestrator)
    g.add_node("memory_save", node_memory_save)

    g.set_entry_point("memory_retrieve")
    g.add_edge("memory_retrieve", "ml_orchestrator")
    g.add_edge("ml_orchestrator", "llm_orchestrator")
    g.add_edge("llm_orchestrator", "memory_save")
    g.add_edge("memory_save", END)
    return g


_compiled = None


def _get_graph():
    global _compiled
    if _compiled is None:
        _compiled = _build_graph().compile()
    return _compiled


async def run_hierarchical_pipeline(state: SharedState) -> GeneratePlanResponse:
    """Execute the hierarchical orchestrator; returns the standard response shape."""
    final = SharedState(**await _get_graph().ainvoke(state.model_dump()))
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
