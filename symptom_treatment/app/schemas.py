"""
Symptom→Treatment Model — Pydantic Schemas
Request/response models for the symptom-treatment prediction microservice.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict


# ─── Requests ─────────────────────────────────────────────────

class SymptomTreatmentRequest(BaseModel):
    """Patient data for Ayurvedic symptom-to-treatment prediction."""

    # Demographics
    age: int = Field(30, ge=0, le=120, description="Patient age")
    gender: str = Field("Male", description="Patient gender: Male or Female")

    # Dosha / Constitution
    prakriti: Optional[str] = Field(None, description="Primary dosha: Vata, Pitta, Kapha, or combination")
    vata_score: Optional[float] = Field(None, description="Vata dosha percentage (0-100)")
    pitta_score: Optional[float] = Field(None, description="Pitta dosha percentage (0-100)")
    kapha_score: Optional[float] = Field(None, description="Kapha dosha percentage (0-100)")

    # Symptoms (free text or structured)
    chief_complaint: Optional[str] = Field(None, description="Primary symptom or complaint")
    symptoms: Optional[Dict[str, int]] = Field(
        default=None,
        description="Symptom dict, e.g. {'headache': 1, 'fatigue': 1, 'fever': 0, ...}",
    )
    symptom_text: Optional[str] = Field(None, description="Free-text symptom description")
    duration: Optional[str] = Field(None, description="Duration of symptoms")
    severity: Optional[str] = Field(None, description="Severity: mild, moderate, severe")

    # Lifestyle / Behavioral
    diet_type: Optional[str] = Field(None, description="Diet type: vegetarian, non-vegetarian, vegan")
    sleep_pattern: Optional[str] = Field(None, description="Sleep quality: good, moderate, poor")
    stress_level: Optional[int] = Field(None, ge=0, le=10, description="Stress level 0-10")
    activity_level: Optional[str] = Field(None, description="Activity level: sedentary, moderate, active")

    # Health metrics
    blood_pressure: Optional[str] = Field(None, description="Blood pressure reading")
    blood_sugar: Optional[float] = Field(None, description="Blood sugar level")
    bmi: Optional[float] = Field(None, description="Body Mass Index")

    top_k: int = Field(5, ge=1, le=20, description="Number of top predictions to return")


# ─── Responses ────────────────────────────────────────────────

class TreatmentRecommendation(BaseModel):
    """Ayurvedic treatment recommendation for a predicted disease."""
    herbs: List[str] = Field(default_factory=list)
    dietary_advice: str = ""
    lifestyle_changes: str = ""
    panchakarma: str = ""
    yoga_pranayama: str = ""


class DiseasePrediction(BaseModel):
    """A single disease prediction with confidence and treatment."""
    rank: int
    disease_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    dosha_involvement: str = ""
    ayurvedic_name: str = ""
    total_cases_in_data: int = 0
    treatment: TreatmentRecommendation = Field(default_factory=TreatmentRecommendation)


class SymptomTreatmentResponse(BaseModel):
    """Response from POST /predict."""
    model_config = {"protected_namespaces": ()}

    patient_age: int
    patient_gender: str
    detected_prakriti: str = "unknown"
    top_k: int
    predictions: List[DiseasePrediction]
    risk_level: str = "low"         # low / moderate / high / critical
    model_version: str = "1.0.0"


class HealthResponse(BaseModel):
    """Response from GET /health."""
    model_config = {"protected_namespaces": ()}

    status: str
    service: str
    model_loaded: bool
    total_diseases: int
    total_features: int
