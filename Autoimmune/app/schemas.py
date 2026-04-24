"""
Autoimmune Model — Pydantic Schemas
Request/response models for the autoimmune prediction microservice.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict


# ─── Requests ─────────────────────────────────────────────────

class DiagnosisRequest(BaseModel):
    """Patient data for autoimmune disorder prediction."""

    # Demographics
    age: int = Field(..., ge=0, le=120, description="Patient age")
    gender: str = Field(..., description="Patient gender: Male or Female")
    sickness_duration_months: float = Field(0, ge=0, description="Duration of sickness in months")

    # Lab values (continuous)
    rbc_count: Optional[float] = Field(None, description="Red blood cell count")
    hemoglobin: Optional[float] = Field(None, description="Hemoglobin level")
    hematocrit: Optional[float] = Field(None, description="Hematocrit percentage")
    mcv: Optional[float] = Field(None, description="Mean corpuscular volume")
    mch: Optional[float] = Field(None, description="Mean corpuscular hemoglobin")
    mchc: Optional[float] = Field(None, description="Mean corpuscular hemoglobin concentration")
    rdw: Optional[float] = Field(None, description="Red cell distribution width")
    reticulocyte_count: Optional[float] = Field(None, description="Reticulocyte count")
    wbc_count: Optional[float] = Field(None, description="White blood cell count")
    neutrophils: Optional[float] = Field(None, description="Neutrophils percentage")
    lymphocytes: Optional[float] = Field(None, description="Lymphocytes percentage")
    monocytes: Optional[float] = Field(None, description="Monocytes percentage")
    eosinophils: Optional[float] = Field(None, description="Eosinophils percentage")
    basophils: Optional[float] = Field(None, description="Basophils percentage")
    plt_count: Optional[float] = Field(None, description="Platelet count")
    mpv: Optional[float] = Field(None, description="Mean platelet volume")
    ana: Optional[float] = Field(None, description="Antinuclear antibody")
    esbach: Optional[float] = Field(None, description="Esbach test result")
    mbl_level: Optional[float] = Field(None, description="Mannose-binding lectin level")
    esr: Optional[float] = Field(None, description="Erythrocyte sedimentation rate")
    c3: Optional[float] = Field(None, description="Complement C3 level")
    c4: Optional[float] = Field(None, description="Complement C4 level")
    crp: Optional[float] = Field(None, description="C-reactive protein")

    # Symptoms (binary 0/1)
    symptoms: Optional[Dict[str, int]] = Field(
        default=None,
        description="Symptoms dict, e.g. {'low_grade_fever': 1, 'fatigue': 0, ...}",
    )

    # Antibody markers (binary 0/1)
    antibodies: Optional[Dict[str, int]] = Field(
        default=None,
        description="Antibody markers dict, e.g. {'anti_dsdna': 1, 'anca': 0, ...}",
    )

    top_k: int = Field(5, ge=1, le=20, description="Number of top predictions to return")


# ─── Responses ────────────────────────────────────────────────

class DiagnosisMatch(BaseModel):
    """A single disorder prediction with confidence score."""
    rank: int
    disease_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    total_cases_in_data: int = 0
    common_symptoms: str = ""
    avg_duration_months: float = 0
    gender_distribution: str = ""


class DiagnosisResponse(BaseModel):
    """Response from POST /predict."""
    model_config = {"protected_namespaces": ()}

    patient_age: int
    patient_gender: str
    top_k: int
    matches: List[DiagnosisMatch]
    model_version: str = "1.0.0"


class DiseaseDetailResponse(BaseModel):
    """Response from GET /diseases/{name}."""
    found: bool
    disease: Optional[DiagnosisMatch] = None


class HealthResponse(BaseModel):
    """Response from GET /health."""
    model_config = {"protected_namespaces": ()}

    status: str
    service: str
    model_loaded: bool
    total_diseases: int
