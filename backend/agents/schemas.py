"""
Dravya AI — Shared schemas for the multi-agent pipeline.

Every agent reads from / writes to `SharedState`.
A2AMessage is the envelope for inter-agent communication.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════

class SafetyVerdict(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    HIGH_RISK = "HIGH_RISK"


class SeverityLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


# ═══════════════════════════════════════════════════════════════
# A2A MESSAGE BUS
# ═══════════════════════════════════════════════════════════════

class A2AMessage(BaseModel):
    """Envelope for agent-to-agent communication."""
    from_agent: str
    to_agent: str
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ═══════════════════════════════════════════════════════════════
# USER INPUT SCHEMAS
# ═══════════════════════════════════════════════════════════════

class UserProfile(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    activity_level: Optional[str] = "moderate"


class HealthMetrics(BaseModel):
    blood_pressure: Optional[str] = None
    blood_sugar_fasting: Optional[str] = None
    blood_sugar_post_meal: Optional[str] = None
    cholesterol: Optional[str] = None
    thyroid_levels: Optional[str] = None
    heart_rate: Optional[str] = None
    sleep_duration: Optional[str] = None
    stress_level: Optional[int] = 5


class DietInfo(BaseModel):
    diet_type: Optional[str] = None
    food_allergies: Optional[str] = None
    daily_water_intake: Optional[str] = None
    current_diet_pattern: Optional[str] = None
    cheat_meal_frequency: Optional[str] = None
    supplements: Optional[str] = None


class MedicalHistory(BaseModel):
    conditions: list[str] = Field(default_factory=list)
    injury_history: Optional[str] = None
    surgery_history: Optional[str] = None


class SymptomsInput(BaseModel):
    chief_complaint: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    body_frame: Optional[str] = None
    skin_type: Optional[str] = None
    hair_type: Optional[str] = None
    energy_pattern: Optional[str] = None
    appetite: Optional[str] = None
    elimination: Optional[str] = None
    sleep_pattern: Optional[str] = None
    weather_sensitivity: Optional[str] = None
    stress_response: Optional[str] = None
    memory_focus: Optional[str] = None
    temperament: Optional[str] = None
    menstrual_cycle: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
# AGENT OUTPUT SCHEMAS
# ═══════════════════════════════════════════════════════════════

class PrakritiResult(BaseModel):
    """Output from the Prakriti Agent."""
    vata_percentage: float = 0.0
    pitta_percentage: float = 0.0
    kapha_percentage: float = 0.0
    dominant_dosha: Optional[str] = "unknown"
    secondary_dosha: Optional[str] = None
    explanation: str = ""
    confidence: float = 0.0


class VikritiResult(BaseModel):
    """Output from the Vikriti Agent."""
    aggravated_doshas: list[str] = Field(default_factory=list)
    classification: str = "unknown"          # acute / chronic / mixed
    severity_score: float = 0.0              # 0-10
    imbalance_explanation: str = ""
    recommendations_summary: str = ""


class DiseaseRisk(BaseModel):
    risk_level: str = "unknown"              # low / moderate / high
    confidence: float = 0.0
    details: str = ""


class SymptomsResult(BaseModel):
    """Output from the Symptoms Agent (aggregated ML model responses)."""
    skin_conditions: dict[str, Any] = Field(default_factory=dict)
    hair_conditions: dict[str, Any] = Field(default_factory=dict)
    pcos_risk: dict[str, Any] = Field(default_factory=dict)
    diabetes_risk: dict[str, Any] = Field(default_factory=dict)
    autoimmune_risk: dict[str, Any] = Field(default_factory=dict)
    obesity_risk: dict[str, Any] = Field(default_factory=dict)
    brahma_dosha: dict[str, Any] = Field(default_factory=dict)
    symptom_treatment_risk: dict[str, Any] = Field(default_factory=dict)
    overall_health_flags: list[str] = Field(default_factory=list)


class HerbRecommendation(BaseModel):
    name: str
    sanskrit_name: Optional[str] = None
    reasoning: str = ""
    dosage_guidance: str = ""
    contraindications: list[str] = Field(default_factory=list)


class DravyaResult(BaseModel):
    """Output from the Dravya (Herbal) Agent."""
    herbs: list[HerbRecommendation] = Field(default_factory=list)
    ayurvedic_reasoning: str = ""
    lifestyle_tips: list[str] = Field(default_factory=list)


class MealRecommendation(BaseModel):
    meal_type: str          # breakfast / lunch / dinner / snack
    suggestions: list[str] = Field(default_factory=list)


class AharaResult(BaseModel):
    """Output from the Ahara (Diet) Agent."""
    foods_to_eat: list[str] = Field(default_factory=list)
    foods_to_avoid: list[str] = Field(default_factory=list)
    meal_pattern: list[MealRecommendation] = Field(default_factory=list)
    seasonal_alignment: str = ""
    dietary_reasoning: str = ""


class SafetyFlag(BaseModel):
    item: str
    risk: str
    reason: str


class SafetyResult(BaseModel):
    """Output from the Safety Agent."""
    verdict: SafetyVerdict = SafetyVerdict.SAFE
    flags: list[SafetyFlag] = Field(default_factory=list)
    disclaimer: str = (
        "This is educational Ayurvedic wellness guidance only. "
        "It is NOT a medical diagnosis or prescription. "
        "Always consult a qualified healthcare professional."
    )
    modified_herbs: Optional[list[HerbRecommendation]] = None


# ═══════════════════════════════════════════════════════════════
# SHARED STATE — passed through the entire pipeline
# ═══════════════════════════════════════════════════════════════

class SharedState(BaseModel):
    """
    Master state passed between all agents in the orchestrator pipeline.
    LangGraph nodes read / mutate this object.
    """

    # ── Inputs ──────────────────────────────────────────────
    user_profile: UserProfile = Field(default_factory=lambda: UserProfile(user_id=""))
    health_metrics: HealthMetrics = Field(default_factory=HealthMetrics)
    diet_info: DietInfo = Field(default_factory=DietInfo)
    medical_history: MedicalHistory = Field(default_factory=MedicalHistory)
    symptoms_input: SymptomsInput = Field(default_factory=SymptomsInput)
    images: list[str] = Field(default_factory=list)  # URLs / paths

    # ── Agent outputs ───────────────────────────────────────
    prakriti: PrakritiResult = Field(default_factory=PrakritiResult)
    vikriti: VikritiResult = Field(default_factory=VikritiResult)
    disease_risk: SymptomsResult = Field(default_factory=SymptomsResult)
    herbs: DravyaResult = Field(default_factory=DravyaResult)
    diet: AharaResult = Field(default_factory=AharaResult)
    safety: SafetyResult = Field(default_factory=SafetyResult)

    # ── Memory context ──────────────────────────────────────
    memory_context: dict[str, Any] = Field(default_factory=dict)
    orchestrator_summary: str = ""

    # ── A2A message bus ─────────────────────────────────────
    messages: list[A2AMessage] = Field(default_factory=list)

    # ── Pipeline metadata ───────────────────────────────────
    pipeline_errors: list[str] = Field(default_factory=list)
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
# API REQUEST / RESPONSE
# ═══════════════════════════════════════════════════════════════

class GeneratePlanRequest(BaseModel):
    """Request body for POST /api/generate-plan."""
    user_profile: UserProfile
    health_metrics: Optional[HealthMetrics] = None
    diet_info: Optional[DietInfo] = None
    medical_history: Optional[MedicalHistory] = None
    symptoms_input: Optional[SymptomsInput] = None
    images: list[str] = Field(default_factory=list)


class GeneratePlanResponse(BaseModel):
    """Response body from the full pipeline."""
    status: str
    prakriti: PrakritiResult
    vikriti: VikritiResult
    disease_risk: SymptomsResult
    herbs: DravyaResult
    diet: AharaResult
    safety: SafetyResult
    orchestrator_summary: str = ""
    pipeline_errors: list[str] = Field(default_factory=list)
