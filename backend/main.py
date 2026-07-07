import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from app.core.security import verify_user
from agents.orchestrator_agent import run_pipeline
from agents.schemas import (
    SharedState, UserProfile, SymptomsInput, MedicalHistory,
    HealthMetrics, DietInfo, SafetyVerdict
)
from agents.llm_client import call_llm
from memory.vector_store import retrieve_relevant_memory, store_health_memory
from app.services.supabase import fetch_row_by_id
from app.utils.encryption import decrypt_json
from app.routes.chat_sessions_route import upsert_chat_session
from app.utils.event_bus import event_bus

load_dotenv()
logger = logging.getLogger("dravya.main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Dravya Labs Orchestrator Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.109:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# Legacy Routers
# -----------------------------------------------------
try:
    from app.routes.onboarding_route import router as onboarding_router
    from app.routes.agent_routes import router as agent_router
    from app.routes.chat_sessions_route import router as chat_sessions_router
    from app.routes.feedback_route import router as feedback_router
    app.include_router(onboarding_router)
    app.include_router(agent_router)
    app.include_router(chat_sessions_router)
    app.include_router(feedback_router)  # Data Flywheel: capture 👍/👎 feedback
except ImportError:
    pass


# Release pooled Supabase sockets on shutdown
@app.on_event("shutdown")
async def _close_pools() -> None:
    try:
        from app.services.supabase_async import close_client as _close_db
        await _close_db()
    except Exception:
        pass
    try:
        from agents.llm_client import close_client as _close_llm
        await _close_llm()
    except Exception:
        pass
    try:
        from app.services.redis_cache import close_redis
        await close_redis()
    except Exception:
        pass

# -----------------------------------------------------
# Frontend Expected Interfaces
# -----------------------------------------------------

class SymptomInput(BaseModel):
    symptoms: str
    age: Optional[int] = None
    gender: Optional[str] = None
    existing_conditions: Optional[str] = None
    session_id: Optional[str] = None

class HomeRemedy(BaseModel):
    name: str
    ingredients: List[str]
    steps: List[str]
    prep_time: str
    expected_results: str
    precautions: Optional[str] = None

class HerbModel(BaseModel):
    name: str
    sanskrit_name: Optional[str] = None
    properties: List[str]
    how_to_consume: str
    dosage: str
    benefits: str
    contraindications: Optional[str] = None

class Medicine(BaseModel):
    name: str
    type: str
    description: str
    dosage: str
    price_range: str
    where_to_buy: str

class AnalysisResult(BaseModel):
    analysis_id: str
    session_id: str
    user_id: str
    severity: str
    dosha_imbalance: str
    primary_symptoms: List[str]
    ayurvedic_interpretation: str
    emergency_warning: Optional[str] = None
    home_remedies: List[HomeRemedy]
    herbs: List[HerbModel]
    medicines: List[Medicine]
    lifestyle_recommendations: List[str]
    dietary_advice: List[str]

class ChatMessageInput(BaseModel):
    message: str
    session_id: str
    context: Optional[Dict] = None

class ChatResponse(BaseModel):
    message_id: str
    response: str
    timestamp: datetime

# -----------------------------------------------------
# Profile Fetching Helper
# -----------------------------------------------------

async def _fetch_user_profile(user_id: str) -> Optional[dict]:
    """Fetch the user's saved health profile from Supabase."""
    try:
        from app.services.supabase_async import select_rows
        records = await select_rows("user_health_profiles", filters={"user_id": f"eq.{user_id}"}, limit=1)
        if records:
            record = records[0]
            if record.get("encrypted_health_json"):
                import json as _json
                decrypted = decrypt_json(record["encrypted_health_json"])
                return _json.loads(decrypted)
    except Exception as e:
        logger.warning("Failed to fetch user profile (non-fatal): %s", e)
    return None


def _profile_to_context_str(profile: dict) -> str:
    """Convert a saved profile dict into a readable string for LLM context."""
    bp = profile.get("basic_profile", {})
    hm = profile.get("health_metrics", {})
    di = profile.get("diet_info", {})
    mh = profile.get("medical_history", {})

    parts = []
    if bp.get("age"): parts.append(f"Age: {bp['age']}")
    if bp.get("gender"): parts.append(f"Gender: {bp['gender']}")
    if bp.get("height"): parts.append(f"Height: {bp['height']} cm")
    if bp.get("weight"): parts.append(f"Weight: {bp['weight']} kg")
    if bp.get("activity_level"): parts.append(f"Activity level: {bp['activity_level']}")
    if hm.get("blood_pressure"): parts.append(f"Blood pressure: {hm['blood_pressure']}")
    if hm.get("blood_sugar_fasting"): parts.append(f"Fasting blood sugar: {hm['blood_sugar_fasting']}")
    if hm.get("cholesterol"): parts.append(f"Cholesterol: {hm['cholesterol']}")
    if hm.get("heart_rate"): parts.append(f"Heart rate: {hm['heart_rate']}")
    if hm.get("sleep_duration"): parts.append(f"Sleep: {hm['sleep_duration']}")
    if hm.get("stress_level"): parts.append(f"Stress level: {hm['stress_level']}/10")
    if di.get("diet_type"): parts.append(f"Diet: {di['diet_type']}")
    if di.get("food_allergies"): parts.append(f"Allergies: {di['food_allergies']}")
    if di.get("supplements"): parts.append(f"Supplements: {di['supplements']}")
    conditions = mh.get("conditions", [])
    if conditions: parts.append(f"Existing conditions: {', '.join(conditions)}")
    if mh.get("injury_history"): parts.append(f"Injury history: {mh['injury_history']}")
    if mh.get("surgery_history"): parts.append(f"Surgery history: {mh['surgery_history']}")

    return ". ".join(parts) if parts else "No saved profile data."


# -----------------------------------------------------
# Endpoints
# -----------------------------------------------------

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_symptoms(symptom_input: SymptomInput, user_id: str = Depends(verify_user)):
    session_id = symptom_input.session_id or str(uuid.uuid4())
    analysis_id = str(uuid.uuid4())

    conditions = []
    if symptom_input.existing_conditions:
        conditions.append(symptom_input.existing_conditions)

    # Fetch saved profile from Supabase to enrich the analysis
    saved_profile = await _fetch_user_profile(user_id)

    # Build enriched UserProfile from saved data
    bp = saved_profile.get("basic_profile", {}) if saved_profile else {}
    hm_data = saved_profile.get("health_metrics", {}) if saved_profile else {}
    di_data = saved_profile.get("diet_info", {}) if saved_profile else {}
    mh_data = saved_profile.get("medical_history", {}) if saved_profile else {}

    # Merge conditions from saved profile + symptom input
    saved_conditions = mh_data.get("conditions", [])
    all_conditions = list(set(saved_conditions + conditions))

    # Convert frontend request into SharedState with full profile data
    initial_state = SharedState(
        user_profile=UserProfile(
            user_id=user_id,
            full_name=bp.get("full_name"),
            age=symptom_input.age or bp.get("age"),
            gender=symptom_input.gender or bp.get("gender"),
            height=bp.get("height"),
            weight=bp.get("weight"),
            location=bp.get("location"),
            occupation=bp.get("occupation"),
            activity_level=bp.get("activity_level", "moderate"),
        ),
        health_metrics=HealthMetrics(
            blood_pressure=hm_data.get("blood_pressure"),
            blood_sugar_fasting=hm_data.get("blood_sugar_fasting"),
            blood_sugar_post_meal=hm_data.get("blood_sugar_post_meal"),
            cholesterol=hm_data.get("cholesterol"),
            thyroid_levels=hm_data.get("thyroid_levels"),
            heart_rate=hm_data.get("heart_rate"),
            sleep_duration=hm_data.get("sleep_duration"),
            stress_level=hm_data.get("stress_level", 5),
        ),
        diet_info=DietInfo(
            diet_type=di_data.get("diet_type"),
            food_allergies=di_data.get("food_allergies"),
            daily_water_intake=di_data.get("daily_water_intake"),
            current_diet_pattern=di_data.get("current_diet_pattern"),
            supplements=di_data.get("supplements"),
        ),
        symptoms_input=SymptomsInput(
            chief_complaint=symptom_input.symptoms
        ),
        medical_history=MedicalHistory(
            conditions=all_conditions,
            injury_history=mh_data.get("injury_history"),
            surgery_history=mh_data.get("surgery_history"),
        )
    )

    try:
        # Run the full orchestrated LangGraph pipeline!
        result = await run_pipeline(initial_state)
        return _build_analysis_result(analysis_id, session_id, user_id, result, symptom_input)
    except Exception as e:
        logger.error(f"Error in Orchestrator Pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class AsyncAnalysisResponse(BaseModel):
    task_id: str
    status: str

@app.post("/api/analyze/async", response_model=AsyncAnalysisResponse)
async def analyze_symptoms_async(symptom_input: SymptomInput, background_tasks: BackgroundTasks, user_id: str = Depends(verify_user)):
    session_id = symptom_input.session_id or str(uuid.uuid4())
    analysis_id = str(uuid.uuid4())
    task_id = str(uuid.uuid4())

    # Re-use the setup logic (in a real app we'd extract this, doing inline for speed)
    conditions = []
    if symptom_input.existing_conditions:
        conditions.append(symptom_input.existing_conditions)
    saved_profile = await _fetch_user_profile(user_id)
    bp = saved_profile.get("basic_profile", {}) if saved_profile else {}
    hm_data = saved_profile.get("health_metrics", {}) if saved_profile else {}
    di_data = saved_profile.get("diet_info", {}) if saved_profile else {}
    mh_data = saved_profile.get("medical_history", {}) if saved_profile else {}
    saved_conditions = mh_data.get("conditions", [])
    all_conditions = list(set(saved_conditions + conditions))

    initial_state = SharedState(
        user_profile=UserProfile(
            user_id=user_id,
            full_name=bp.get("full_name"),
            age=symptom_input.age or bp.get("age"),
            gender=symptom_input.gender or bp.get("gender"),
            height=bp.get("height"),
            weight=bp.get("weight"),
            location=bp.get("location"),
            occupation=bp.get("occupation"),
            activity_level=bp.get("activity_level", "moderate"),
        ),
        health_metrics=HealthMetrics(
            blood_pressure=hm_data.get("blood_pressure"),
            blood_sugar_fasting=hm_data.get("blood_sugar_fasting"),
            blood_sugar_post_meal=hm_data.get("blood_sugar_post_meal"),
            cholesterol=hm_data.get("cholesterol"),
            thyroid_levels=hm_data.get("thyroid_levels"),
            heart_rate=hm_data.get("heart_rate"),
            sleep_duration=hm_data.get("sleep_duration"),
            stress_level=hm_data.get("stress_level", 5),
        ),
        diet_info=DietInfo(
            diet_type=di_data.get("diet_type"),
            food_allergies=di_data.get("food_allergies"),
            daily_water_intake=di_data.get("daily_water_intake"),
            current_diet_pattern=di_data.get("current_diet_pattern"),
            supplements=di_data.get("supplements"),
        ),
        symptoms_input=SymptomsInput(
            chief_complaint=symptom_input.symptoms
        ),
        medical_history=MedicalHistory(
            conditions=all_conditions,
            injury_history=mh_data.get("injury_history"),
            surgery_history=mh_data.get("surgery_history"),
        )
    )

    background_tasks.add_task(_run_pipeline_task, task_id, initial_state, symptom_input, analysis_id, session_id, user_id)
    return AsyncAnalysisResponse(task_id=task_id, status="processing")

@app.websocket("/ws/analyze/{task_id}")
async def websocket_analyze(websocket: WebSocket, task_id: str):
    await websocket.accept()
    queue = event_bus.get_queue(task_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event)
            if event.get("status") in ["complete", "error"]:
                break
    except WebSocketDisconnect:
        pass
    finally:
        event_bus.remove_queue(task_id)

async def _run_pipeline_task(task_id: str, initial_state: SharedState, symptom_input: SymptomInput, analysis_id: str, session_id: str, user_id: str):
    from app.core.config import settings
    from agents.schemas import GeneratePlanResponse
    try:
        if settings.USE_HIERARCHICAL_ORCHESTRATOR:
            from agents.hierarchical_orchestrator import _get_graph
            graph = _get_graph()
        else:
            from agents.orchestrator_agent import _get_graph
            graph = _get_graph()

        final_state_dict = None
        async for event in graph.astream(initial_state.model_dump()):
            node_name = list(event.keys())[0]
            await event_bus.publish(task_id, {"status": "progress", "node": node_name})
            final_state_dict = event[node_name]

        final = SharedState(**final_state_dict)
        result = GeneratePlanResponse(
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

        analysis_result = _build_analysis_result(analysis_id, session_id, user_id, result, symptom_input)
        await event_bus.publish(task_id, {"status": "complete", "result": analysis_result.dict()})
    except Exception as e:
        logger.error(f"Error in background task: {e}")
        await event_bus.publish(task_id, {"status": "error", "message": str(e)})

def _build_analysis_result(analysis_id: str, session_id: str, user_id: str, result: Any, symptom_input: SymptomInput) -> AnalysisResult:
    from agents.schemas import SafetyVerdict
    emergency_warning = None
    if result.safety.verdict == SafetyVerdict.HIGH_RISK:
        flags_str = " ".join([f.reason for f in result.safety.flags])
        emergency_warning = f"⚠️ HIGH RISK: {flags_str} Consult your doctor immediately."

    mapped_herbs = []
    for h in result.herbs.herbs:
        mapped_herbs.append(HerbModel(
            name=h.name,
            sanskrit_name=h.sanskrit_name,
            properties=[],
            how_to_consume="",
            dosage=h.dosage_guidance or "As directed",
            benefits=h.reasoning,
            contraindications=", ".join(h.contraindications) if h.contraindications else None
        ))

    diet_advice = result.diet.foods_to_eat + [f"Avoid: {f}" for f in result.diet.foods_to_avoid]

    severity_score = result.vikriti.severity_score
    if severity_score > 7:
        sev = "urgent"
    elif severity_score > 4:
        sev = "moderate"
    else:
        sev = "mild"
        
    if result.safety.verdict == SafetyVerdict.HIGH_RISK:
        sev = "emergency"

    dosha = (result.prakriti.dominant_dosha or "vata").lower()
    if dosha == "unknown" or not dosha:
        dosha = "vata"
        
    summary = result.orchestrator_summary
    if not summary:
        summary = "We successfully ran your analysis based on our ML Models. Refer to Diet and Herbs!"

    session_title = symptom_input.symptoms[:80] if symptom_input.symptoms else "Symptom Analysis"
    upsert_chat_session(user_id, session_id, session_title)

    return AnalysisResult(
        analysis_id=analysis_id,
        session_id=session_id,
        user_id=user_id,
        severity=sev,
        dosha_imbalance=dosha,
        primary_symptoms=[symptom_input.symptoms],
        ayurvedic_interpretation=summary,
        emergency_warning=emergency_warning,
        home_remedies=[],  
        herbs=mapped_herbs,
        medicines=[],
        lifestyle_recommendations=result.herbs.lifestyle_tips,
        dietary_advice=diet_advice
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message_input: ChatMessageInput, user_id: str = Depends(verify_user)):
    # Retrieve Pinecone Chat memory for this session
    previous_memory = ""
    try:
        context = retrieve_relevant_memory(message_input.session_id, message_input.message)
        if context:
            previous_memory = "\n".join([r.get('text', '') for r in context])
    except Exception as e:
        logger.warning(f"Pinecone memory search failed: {e}")

    # Fetch user's saved health profile for personalized responses
    profile_context = "No saved profile."
    if user_id:
        saved_profile = await _fetch_user_profile(user_id)
        if saved_profile:
            profile_context = _profile_to_context_str(saved_profile)

    system_prompt = (
        "You are a helpful Ayurvedic wellness assistant for Dravya Health. "
        "You provide brief, safety-first, personalized answers based on the user's health profile. "
        "Always recommend consulting a healthcare professional for serious concerns.\n\n"
        f"--- USER HEALTH PROFILE ---\n{profile_context}\n\n"
        f"--- PREVIOUS CONTEXT ---\n{previous_memory}"
    )
    
    try:
        res = await call_llm(system_prompt, message_input.message)
        # Using the LLM client we built which parses JSON. The prompt might not return JSON, so we get 'raw_response'
        resp_text = res.get("raw_response", res.get("response", str(res)))
        if "{" in resp_text and "}" in resp_text and isinstance(res, dict) and "response" not in res and "raw_response" not in res:
             # Just cast to str if it accidentally parsed JSON
             resp_text = str(res)
        
        # We should save this interaction to vector store
        try:
            store_health_memory(
                message_input.session_id,
                f"User: {message_input.message}\nAssistant: {resp_text}",
                {"type": "chat"}
            )
        except Exception as e:
            logger.warning(f"Pinecone memory save failed: {e}")

        # Track session in Supabase
        if user_id:
            chat_title = message_input.message[:80]
            upsert_chat_session(user_id, message_input.session_id, chat_title)
            
        return ChatResponse(
            message_id=str(uuid.uuid4()),
            response=resp_text,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error in LLM Call: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------
# Treatment Plan Models & Endpoints
# -----------------------------------------------------

class TreatmentTaskModel(BaseModel):
    id: str
    description: str
    time_of_day: str  # "morning" | "afternoon" | "evening" | "night"
    category: str  # "herb" | "diet" | "lifestyle" | "therapy"

class TreatmentDayModel(BaseModel):
    day_number: int
    tasks: List[TreatmentTaskModel]
    focus: str  # Brief daily focus/theme

class TreatmentPlanModel(BaseModel):
    treatment_id: str
    condition: str
    severity: str
    days: List[TreatmentDayModel]
    review_after_days: int
    duration_days: int
    created_at: str
    overview: str

class GenerateTreatmentInput(BaseModel):
    session_id: str
    condition: str
    severity: Optional[str] = "moderate"

class ReviewTreatmentInput(BaseModel):
    treatment_id: str
    condition: str
    completed_tasks: List[str]  # list of completed task IDs
    total_tasks: int
    user_feedback: Optional[str] = None

class TreatmentReviewResult(BaseModel):
    status: str  # "improving" | "worsening" | "stable"
    recommendation: str
    refer_to_doctor: bool
    adjusted_plan: Optional[TreatmentPlanModel] = None


def _parse_treatment_plan(raw: str, condition: str, severity: str) -> TreatmentPlanModel:
    """Parse the LLM-generated treatment plan JSON from raw text."""
    import json as _json
    treatment_id = str(uuid.uuid4())

    # Try to extract JSON from the response
    try:
        # Find JSON block in the response
        json_start = raw.find('{')
        json_end = raw.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            plan_data = _json.loads(raw[json_start:json_end])
        else:
            plan_data = _json.loads(raw)
    except _json.JSONDecodeError:
        # Fallback: create a structured plan from text
        plan_data = None

    if plan_data and "days" in plan_data:
        days = []
        for d in plan_data["days"]:
            tasks = []
            for t in d.get("tasks", []):
                tasks.append(TreatmentTaskModel(
                    id=t.get("id", str(uuid.uuid4())),
                    description=t.get("description", ""),
                    time_of_day=t.get("time_of_day", "morning"),
                    category=t.get("category", "lifestyle"),
                ))
            days.append(TreatmentDayModel(
                day_number=d.get("day_number", 1),
                tasks=tasks,
                focus=d.get("focus", "General wellness"),
            ))
        return TreatmentPlanModel(
            treatment_id=treatment_id,
            condition=condition,
            severity=severity,
            days=days,
            review_after_days=plan_data.get("review_after_days", 7),
            duration_days=plan_data.get("duration_days", 7),
            created_at=datetime.utcnow().isoformat(),
            overview=plan_data.get("overview", f"Ayurvedic treatment plan for {condition}"),
        )

    # Fallback plan if LLM didn't return valid JSON
    fallback_days = []
    for day_num in range(1, 8):
        fallback_days.append(TreatmentDayModel(
            day_number=day_num,
            tasks=[
                TreatmentTaskModel(id=f"t{day_num}-1", description="Drink warm water with lemon on empty stomach", time_of_day="morning", category="diet"),
                TreatmentTaskModel(id=f"t{day_num}-2", description="Apply neem and turmeric paste on affected area", time_of_day="morning", category="therapy"),
                TreatmentTaskModel(id=f"t{day_num}-3", description="Take Triphala churna (1 tsp with warm water)", time_of_day="afternoon", category="herb"),
                TreatmentTaskModel(id=f"t{day_num}-4", description="Practice 15 minutes of Pranayama breathing", time_of_day="evening", category="lifestyle"),
                TreatmentTaskModel(id=f"t{day_num}-5", description="Apply aloe vera gel before sleep", time_of_day="night", category="therapy"),
            ],
            focus=f"Day {day_num}: Detox and healing",
        ))
    return TreatmentPlanModel(
        treatment_id=treatment_id,
        condition=condition,
        severity=severity,
        days=fallback_days,
        review_after_days=7,
        duration_days=7,
        created_at=datetime.utcnow().isoformat(),
        overview=f"7-day Ayurvedic treatment plan for {condition}",
    )


@app.post("/api/treatment/generate", response_model=TreatmentPlanModel)
async def generate_treatment(input_data: GenerateTreatmentInput, user_id: str = Depends(verify_user)):
    """Generate a structured daily Ayurvedic treatment plan using AI."""
    # Optionally enrich with user profile
    profile_context = "No saved profile."
    if user_id:
        saved = await _fetch_user_profile(user_id)
        if saved:
            profile_context = _profile_to_context_str(saved)

    prompt = f"""You are an expert Ayurvedic practitioner. Generate a detailed 7-day treatment plan for the condition: "{input_data.condition}" (severity: {input_data.severity}).

Patient profile: {profile_context}

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
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

Each day should have 4-6 tasks covering these categories:
- "herb": Herbal remedies with specific dosages
- "diet": Dietary recommendations
- "lifestyle": Yoga, pranayama, sleep habits
- "therapy": External applications, massages, therapies

time_of_day must be one of: "morning", "afternoon", "evening", "night"

Make tasks specific, actionable, and progressively build on each other across the 7 days. Focus on Ayurvedic principles relevant to {input_data.condition}."""

    try:
        result = await call_llm(
            "You are a structured JSON generator for Ayurvedic treatment plans. Return ONLY valid JSON.",
            prompt,
        )
        raw = result.get("raw_response", result.get("response", str(result)))
        plan = _parse_treatment_plan(raw, input_data.condition, input_data.severity or "moderate")
        return plan
    except Exception as e:
        logger.error(f"Treatment plan generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/treatment/review", response_model=TreatmentReviewResult)
async def review_treatment(input_data: ReviewTreatmentInput, user_id: str = Depends(verify_user)):
    """Review treatment progress and decide whether to adjust or refer to doctor."""
    completion_pct = (len(input_data.completed_tasks) / max(input_data.total_tasks, 1)) * 100

    profile_context = "No saved profile."
    if user_id:
        saved = await _fetch_user_profile(user_id)
        if saved:
            profile_context = _profile_to_context_str(saved)

    prompt = f"""You are an expert Ayurvedic practitioner reviewing a patient's treatment progress.

Condition: {input_data.condition}
Treatment completion: {completion_pct:.0f}% ({len(input_data.completed_tasks)} of {input_data.total_tasks} tasks completed)
Patient feedback: {input_data.user_feedback or "No feedback provided"}
Patient profile: {profile_context}

Based on the completion rate and feedback, evaluate the treatment progress.

Return ONLY valid JSON in this exact format:
{{
  "status": "improving" or "worsening" or "stable",
  "recommendation": "Detailed recommendation text",
  "refer_to_doctor": true or false
}}

Guidelines:
- If completion is >70% and feedback is positive → "improving"
- If completion is <30% or feedback mentions worsening → "worsening" with refer_to_doctor=true
- Otherwise → "stable"
- If worsening, strongly recommend consulting a personal doctor
- If improving, suggest ways to accelerate recovery
- Be empathetic and encouraging"""

    try:
        result = await call_llm(
            "You are a structured JSON generator for treatment reviews. Return ONLY valid JSON.",
            prompt,
        )
        raw = result.get("raw_response", result.get("response", str(result)))

        import json as _json
        try:
            json_start = raw.find('{')
            json_end = raw.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                review_data = _json.loads(raw[json_start:json_end])
            else:
                review_data = _json.loads(raw)
        except _json.JSONDecodeError:
            # Fallback based on completion percentage
            if completion_pct >= 70:
                review_data = {
                    "status": "improving",
                    "recommendation": "Great progress! Continue with the current treatment plan. Your dedication is showing results.",
                    "refer_to_doctor": False,
                }
            elif completion_pct <= 30:
                review_data = {
                    "status": "worsening",
                    "recommendation": "The treatment doesn't seem to be working as expected. We strongly recommend consulting a personal doctor or Ayurvedic practitioner for a thorough examination.",
                    "refer_to_doctor": True,
                }
            else:
                review_data = {
                    "status": "stable",
                    "recommendation": "Your condition is stable. Try to be more consistent with the daily tasks for better results.",
                    "refer_to_doctor": False,
                }

        return TreatmentReviewResult(
            status=review_data.get("status", "stable"),
            recommendation=review_data.get("recommendation", "Continue with the plan."),
            refer_to_doctor=review_data.get("refer_to_doctor", False),
            adjusted_plan=None,
        )
    except Exception as e:
        logger.error(f"Treatment review failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Dravya Orchestrator Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)