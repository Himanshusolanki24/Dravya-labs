"""AgentScope sequential orchestrator: memory → ML facts → Vaidya → safety → save."""

from __future__ import annotations

import json
import logging
from contextvars import ContextVar
from datetime import datetime
from typing import Any, Callable, Optional

from agents.critic_agent import CriticAgent
from agents.ml_orchestrator import run_ml_orchestrator
from agents.schemas import (
    AharaResult,
    CritiqueResult,
    DravyaResult,
    GeneratePlanResponse,
    HerbRecommendation,
    LLMResponse,
    MLFacts,
    PrakritiResult,
    SafetyFlag,
    SafetyResult,
    SafetyVerdict,
    SharedState,
    SymptomsResult,
    VikritiResult,
)
from app.agentscope_runtime.chat_model import ChatResponse as AgentChatResponse, DravyaChatModel
from app.agentscope_runtime.pipeline import make_msg, sequential_pipeline
from app.agentscope_runtime.rag import build_rag_context, retrieve_knowledge
from app.core.config import settings
from memory.health_memory_manager import retrieve_health_context, save_consultation

logger = logging.getLogger("dravya.agentscope.orchestrator")

_state_var: ContextVar[SharedState] = ContextVar("agentscope_shared_state")
_progress_var: ContextVar[Optional[Callable]] = ContextVar("agentscope_progress", default=None)


VAIDYA_PROMPT = """\
You are the Vaidya for Dravya Health — an empathetic Ayurvedic wellness assistant.
Turn the structured facts and retrieved knowledge into a clear, personalized plan.

Structure with markdown headers: Constitution • Current Snapshot • Historical Context •
Herbal Protocol • Dietary Plan • Lifestyle • Safety.
Ground every recommendation in the ML facts and retrieved knowledge.
You are NOT a medical doctor — always include a disclaimer, and advise professional
consultation when risk flags are present.
{few_shot}
{critique_feedback}
{rag_context}
"""


def _current_state() -> SharedState:
    return _state_var.get()


async def _emit(node: str) -> None:
    callback = _progress_var.get()
    if callback:
        await callback(node)


def _herb_items(raw: Any) -> list[HerbRecommendation]:
    if not isinstance(raw, dict):
        return []
    items = raw.get("herbs") or raw.get("matches") or raw.get("results") or raw.get("top_herbs") or []
    herbs: list[HerbRecommendation] = []
    if isinstance(items, dict):
        items = list(items.values())
    for item in items[:8]:
        if isinstance(item, str):
            herbs.append(HerbRecommendation(name=item, reasoning="ML herb match"))
            continue
        if not isinstance(item, dict):
            continue
        name = item.get("name") or item.get("herb") or item.get("food_name") or "Herb"
        herbs.append(
            HerbRecommendation(
                name=str(name),
                sanskrit_name=item.get("sanskrit_name") or item.get("latin_name"),
                reasoning=str(item.get("reasoning") or item.get("preview") or item.get("therapeutic_uses") or ""),
                dosage_guidance=str(item.get("dosage") or item.get("dosage_guidance") or ""),
                contraindications=[str(item.get("contraindications"))] if item.get("contraindications") else [],
            )
        )
    return herbs


def _diet_from_facts(raw: Any) -> AharaResult:
    if not isinstance(raw, dict):
        return AharaResult()
    foods = raw.get("foods") or raw.get("matches") or raw.get("results") or []
    names: list[str] = []
    for item in foods[:8]:
        if isinstance(item, str):
            names.append(item)
        elif isinstance(item, dict):
            names.append(str(item.get("food_name") or item.get("name") or ""))
    names = [name for name in names if name]
    return AharaResult(
        foods_to_eat=names,
        dietary_reasoning=str(raw.get("reasoning") or raw.get("summary") or ""),
    )


def apply_ml_facts(state: SharedState, facts: MLFacts) -> SharedState:
    state.ml_facts = facts
    dosha = facts.dominant_dosha or "unknown"
    state.prakriti = PrakritiResult(
        dominant_dosha=dosha,
        explanation="Predicted from the Brahma prakriti model.",
        confidence=float(facts.brahma.get("confidence") or 0.0) if isinstance(facts.brahma, dict) else 0.0,
    )
    severity = 3.0
    if any("high" in flag or "critical" in flag for flag in facts.health_flags):
        severity = 8.0
    elif any("moderate" in flag for flag in facts.health_flags):
        severity = 5.0
    state.vikriti = VikritiResult(
        aggravated_doshas=[dosha] if dosha != "unknown" else [],
        severity_score=severity,
        imbalance_explanation="Derived from concurrent ML health flags.",
    )
    state.disease_risk = SymptomsResult(
        skin_conditions=facts.skin,
        hair_conditions=facts.hair,
        pcos_risk=facts.pcos,
        diabetes_risk=facts.diabetes,
        autoimmune_risk=facts.autoimmune,
        obesity_risk=facts.obesity,
        brahma_dosha=facts.brahma,
        symptom_treatment_risk=facts.symptom_treatment,
        overall_health_flags=facts.health_flags,
    )
    state.herbs = DravyaResult(herbs=_herb_items(facts.herbs), ayurvedic_reasoning="Grounded in the herbs microservice.")
    state.diet = _diet_from_facts(facts.dietplain)
    return state


class MemoryAgent:
    name = "memory_retrieve"

    async def __call__(self, msg: Any = None) -> Any:
        state = _current_state()
        state.started_at = datetime.utcnow().isoformat()
        await _emit(self.name)
        try:
            context = await retrieve_health_context(state.user_profile.user_id)
            query = state.symptoms_input.chief_complaint or "ayurvedic wellness"
            chunks = await retrieve_knowledge(query, user_id=state.user_profile.user_id)
            context["classical_knowledge"] = chunks
            state.memory_context = context
        except Exception as exc:
            logger.warning("Memory retrieve failed (non-fatal): %s", exc)
            state.pipeline_errors.append(f"memory_retrieve: {exc}")
        return msg or make_msg(self.name, "memory loaded", "assistant")


class MLFactsAgent:
    name = "ml_orchestrator"

    def __init__(self, ml_runner: Optional[Callable] = None) -> None:
        self.ml_runner = ml_runner or run_ml_orchestrator

    async def __call__(self, msg: Any = None) -> Any:
        state = _current_state()
        await _emit(self.name)
        try:
            facts = await self.ml_runner(state)
            apply_ml_facts(state, facts)
            state.pipeline_errors.extend(facts.errors)
        except Exception as exc:
            logger.error("ML orchestrator failed: %s", exc)
            state.pipeline_errors.append(f"ml_orchestrator: {exc}")
        return msg or make_msg(self.name, "ml facts ready", "assistant")


class VaidyaAgent:
    name = "vaidya"

    def __init__(self, chat_model: Optional[DravyaChatModel] = None) -> None:
        self.chat_model = chat_model or DravyaChatModel()
        self.critic = CriticAgent()

    async def __call__(self, msg: Any = None) -> Any:
        state = _current_state()
        await _emit(self.name)
        query = state.symptoms_input.chief_complaint or "dosha balanced wellness plan"
        chunks = await retrieve_knowledge(
            query,
            user_id=state.user_profile.user_id,
            include_fewshot=True,
            dosha=state.ml_facts.dominant_dosha,
        )
        few_shot = ""
        try:
            from app.services.few_shot_retriever import get_few_shot_examples

            few_shot = await get_few_shot_examples(query, state.ml_facts.dominant_dosha)
        except Exception as exc:
            logger.warning("Few-shot fetch failed (non-fatal): %s", exc)

        user_summary = (
            f"age={state.user_profile.age}, gender={state.user_profile.gender}, "
            f"dosha={state.ml_facts.dominant_dosha}, flags={state.ml_facts.health_flags}, "
            f"complaint={query}"
        )
        rag_context = build_rag_context(user_summary, chunks)
        facts_blob = json.dumps(state.ml_facts.model_dump(), default=str)[:4000]
        memories = state.memory_context.get("memories") or []
        memory_text = "\n".join(str(item.get("text", item)) for item in memories[:5]) or "none"

        draft = ""
        model_used = self.chat_model.model
        league_used = state.llm_league or "medium"
        critique = CritiqueResult()
        feedback = ""
        for attempt in range(1, settings.MAX_CRITIC_RETRIES + 1):
            system = VAIDYA_PROMPT.format(
                few_shot=few_shot,
                critique_feedback=feedback,
                rag_context=rag_context,
            )
            if state.chat_skill_bodies:
                system = "USER SKILLS:\n" + "\n".join(state.chat_skill_bodies) + "\n\n" + system
            if state.chat_caveman:
                from app.mcp.caveman import CAVEMAN_SYSTEM
                system = CAVEMAN_SYSTEM + "\nUse short headers. Skip fluff.\n\n" + system
            user_message = (
                f"ML FACTS:\n{facts_blob}\n\nPRIOR CONSULTATIONS:\n{memory_text}\n\n"
                f"Write the wellness plan now."
            )
            try:
                from app.mcp.caveman import max_tokens_for

                response = await self.chat_model(
                    system,
                    user_message,
                    league=state.llm_league or "medium",
                    user_id=state.user_profile.user_id,
                    max_tokens=max_tokens_for(state.chat_caveman),
                )
                draft = response.text
                model_used = response.model_used
                league_used = response.league_used or league_used
            except Exception as exc:
                from agents.llm_leagues import QuotaExceeded

                if isinstance(exc, QuotaExceeded):
                    raise
                logger.warning("Vaidya LLM failed, using ML-backed fallback: %s", exc)
                draft = _fallback_plan(state)
                model_used = "fallback"
                critique = CritiqueResult(approved=True, reasons=[f"llm_error: {exc}"], retry_count=attempt - 1)
                break
            critique = await self.critic.evaluate(
                draft,
                dosha=state.ml_facts.dominant_dosha,
                conditions=state.medical_history.conditions,
                ml_flags=state.ml_facts.health_flags,
                retry_count=attempt - 1,
            )
            if critique.approved:
                break
            feedback = (
                "\nPREVIOUS DRAFT WAS REJECTED. Fix these issues:\n"
                f"{critique.fix_instructions}\n"
            )

        state.llm_response = LLMResponse(
            text=draft,
            model_used=model_used,
            league_used=league_used,
            route="complex",
            attempts=critique.retry_count + 1,
        )
        state.critique = critique
        state.orchestrator_summary = draft
        return make_msg(self.name, draft, "assistant")


class SafetyAgent:
    name = "safety"

    async def __call__(self, msg: Any = None) -> Any:
        state = _current_state()
        await _emit(self.name)
        verdict = SafetyVerdict.SAFE
        flags: list[SafetyFlag] = []
        if any("critical" in flag or "high" in flag for flag in state.ml_facts.health_flags):
            verdict = SafetyVerdict.HIGH_RISK
            flags.append(SafetyFlag(item="ml_health_flags", risk="elevated", reason="; ".join(state.ml_facts.health_flags)))
        elif not state.critique.approved:
            verdict = SafetyVerdict.WARNING
            flags.append(SafetyFlag(item="critic", risk="quality", reason="; ".join(state.critique.reasons) or "critic rejected draft"))
        state.safety = SafetyResult(verdict=verdict, flags=flags)
        state.orchestrator_logs = {
            "route": state.llm_response.route,
            "model_used": state.llm_response.model_used,
            "league_used": state.llm_response.league_used,
            "attempts": state.llm_response.attempts,
            "critic_approved": state.critique.approved,
            "critic_reasons": state.critique.reasons,
            "dominant_dosha": state.ml_facts.dominant_dosha,
            "health_flags": state.ml_facts.health_flags,
            "ml_errors": state.ml_facts.errors,
            "runtime": "agentscope",
        }
        return msg or make_msg(self.name, state.safety.verdict.value, "assistant")


class MemorySaveAgent:
    name = "memory_save"

    async def __call__(self, msg: Any = None) -> Any:
        state = _current_state()
        await _emit(self.name)
        state.completed_at = datetime.utcnow().isoformat()
        try:
            await save_consultation(
                state.user_profile.user_id,
                {
                    "summary": state.orchestrator_summary,
                    "orchestrator_logs": state.orchestrator_logs,
                    "pipeline_errors": state.pipeline_errors,
                    "prakriti": state.prakriti.model_dump(),
                    "vikriti": state.vikriti.model_dump(),
                    "herbs": state.herbs.model_dump(),
                    "safety": state.safety.model_dump(),
                },
            )
        except Exception as exc:
            logger.warning("Memory save failed (non-fatal): %s", exc)
            state.pipeline_errors.append(f"memory_save: {exc}")
        return msg or make_msg(self.name, "saved", "assistant")


def _fallback_plan(state: SharedState) -> str:
    herbs = ", ".join(h.name for h in state.herbs.herbs) or "none listed"
    foods = ", ".join(state.diet.foods_to_eat) or "fresh, dosha-aligned meals"
    flags = ", ".join(state.ml_facts.health_flags) or "none"
    return (
        f"## Constitution\nDominant dosha from ML: {state.ml_facts.dominant_dosha}.\n\n"
        f"## Current Snapshot\nChief complaint: {state.symptoms_input.chief_complaint or 'n/a'}. "
        f"Health flags: {flags}.\n\n"
        f"## Herbal Protocol\n{herbs}\n\n"
        f"## Dietary Plan\n{foods}\n\n"
        "## Safety\nThis is educational Ayurvedic wellness guidance only. "
        "It is NOT a medical diagnosis or prescription. Consult a qualified clinician."
    )


async def run_agentscope_pipeline(
    state: SharedState,
    *,
    ml_runner: Optional[Callable] = None,
    chat_model: Optional[DravyaChatModel] = None,
    on_progress: Optional[Callable] = None,
) -> GeneratePlanResponse:
    token = _state_var.set(state)
    progress_token = _progress_var.set(on_progress)
    try:
        agents = [
            MemoryAgent(),
            MLFactsAgent(ml_runner=ml_runner),
            VaidyaAgent(chat_model=chat_model),
            SafetyAgent(),
            MemorySaveAgent(),
        ]
        complaint = state.symptoms_input.chief_complaint or "Ayurvedic wellness analysis"
        await sequential_pipeline(agents, make_msg("user", complaint, "user"))
        final = _current_state()
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
    finally:
        _state_var.reset(token)
        _progress_var.reset(progress_token)


async def run_rag_chat(
    message: str,
    *,
    user_id: str,
    session_id: str,
    profile_context: str,
    league: str = "medium",
    chat_model: Optional[DravyaChatModel] = None,
    caveman: Optional[bool] = None,
    skill_ids: Optional[list[str]] = None,
    extra_skills: Optional[list[str]] = None,
) -> AgentChatResponse:
    chunks = await retrieve_knowledge(message, user_id=user_id)
    rag = build_rag_context(profile_context, chunks)
    from app.mcp.chat_context import resolve_prompt

    system, use_caveman, max_tokens = await resolve_prompt(
        user_id,
        message,
        profile_context="",
        rag=rag,
        caveman=caveman,
        skill_ids=skill_ids,
        extra_skills=extra_skills,
    )
    model = chat_model or DravyaChatModel(league=league, user_id=user_id)
    try:
        response = await model(
            system, message, league=league, user_id=user_id, max_tokens=max_tokens,
        )
    except Exception as exc:
        from agents.llm_leagues import QuotaExceeded

        if isinstance(exc, QuotaExceeded):
            raise
        logger.warning("Chat LLM failed: %s", exc)
        text = (
            "I can still share general Ayurvedic wellness guidance. "
            "Please consult a clinician for personal medical decisions. "
            + (" Retrieved notes: " + "; ".join(chunks[:2]) if chunks else "")
        )
        response = AgentChatResponse(text=text, model_used="fallback", league_used=league, league_requested=league)
    try:
        from app.agentscope_runtime.knowledge import get_knowledge_registry

        await get_knowledge_registry().user_consultations.add_documents(
            [f"User: {message}\nAssistant: {response.text}"],
            metadata={"user_id": user_id, "session_id": session_id, "type": "chat"},
        )
    except Exception as exc:
        logger.warning("Chat memory index failed: %s", exc)
    return response


async def run_rag_treatment(
    condition: str,
    severity: str,
    profile_context: str,
    *,
    user_id: str = "",
    chat_model: Optional[DravyaChatModel] = None,
) -> str:
    chunks = await retrieve_knowledge(f"Ayurvedic treatment plan for {condition}", user_id=user_id or None)
    rag = build_rag_context(profile_context, chunks)
    model = chat_model or DravyaChatModel(league="medium", user_id=user_id or None)
    prompt = f"""Generate a detailed 7-day treatment plan for "{condition}" (severity: {severity}).

Patient profile: {profile_context}

{rag}

Return ONLY valid JSON in this exact format:
{{
  "overview": "Brief overview of the treatment approach",
  "duration_days": 7,
  "review_after_days": 7,
  "days": [
    {{
      "day_number": 1,
      "focus": "Theme for this day",
      "tasks": [
        {{
          "id": "d1t1",
          "description": "Specific task description with dosage/timing",
          "time_of_day": "morning",
          "category": "herb"
        }}
      ]
    }}
  ]
}}
"""
    try:
        response = await model(
            "You are a structured JSON generator for Ayurvedic treatment plans. Return ONLY valid JSON.",
            prompt,
        )
        return response.text
    except Exception as exc:
        logger.warning("Treatment LLM failed: %s", exc)
        return json.dumps({"overview": f"Educational wellness outline for {condition}", "error": str(exc)})
