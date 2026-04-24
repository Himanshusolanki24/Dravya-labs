"""
Herb Model — Pydantic Schemas
Request/response models for the Ayurvedic herb prediction microservice.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ─── Requests ─────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Symptom/property/dosha text query for Ayurvedic herb matching."""
    query: str = Field(
        ..., min_length=2, max_length=2000,
        description="Symptom, dosha, or Ayurvedic property description",
        examples=["digestive Pitta cooling Sheeta virya"],
    )
    top_k: int = Field(5, ge=1, le=50, description="Number of matches to return")


class DoshaFilterRequest(BaseModel):
    """Filter herbs by dosha pacification."""
    dosha: str = Field(
        ..., description="Dosha to pacify: Vata, Pitta, or Kapha",
        examples=["Pitta"],
    )
    top_k: int = Field(10, ge=1, le=100, description="Number of herbs to return")


class RasaFilterRequest(BaseModel):
    """Filter herbs by Rasa (taste)."""
    rasa: str = Field(
        ..., description="Rasa (taste): Madhura, Amla, Lavana, Katu, Tikta, or Kashaya",
        examples=["Tikta"],
    )
    top_k: int = Field(10, ge=1, le=100, description="Number of herbs to return")


# ─── Responses ────────────────────────────────────────────────

class HerbMatch(BaseModel):
    """A single Ayurvedic herb match with confidence score and Dravyaguna details."""
    rank: int
    name: str
    latin_name: str = ""
    hindi_name: str = ""
    confidence: float = Field(..., ge=0.0, le=1.0)
    # Dravyaguna properties
    rasa: str = ""
    guna: str = ""
    virya: str = ""
    vipaka: str = ""
    prabhava: str = ""
    # Dosha effects
    pacify_dosha: str = ""
    aggravate_dosha: str = ""
    tridosha: bool = False
    # Therapeutic info
    category: str = ""
    therapeutic_uses: str = ""
    contraindications: str = ""
    preview: str = ""
    source_url: str = ""


class PredictionResponse(BaseModel):
    """Response from POST /predict."""
    query: str
    top_k: int
    matches: List[HerbMatch]
    model_version: str = "2.0.0"


class HerbDetailResponse(BaseModel):
    """Response from GET /herbs/{name}."""
    found: bool
    herb: Optional[HerbMatch] = None


class DoshaHerbsResponse(BaseModel):
    """Response from GET /herbs/by-dosha/{dosha}."""
    dosha: str
    count: int
    herbs: List[HerbMatch]


class SafetyInfoResponse(BaseModel):
    """Response from GET /herbs/safety/{herb_name}."""
    herb_name: str
    found: bool
    virya: str = ""
    aggravate_dosha: str = ""
    contraindications: str = ""
    safety_notes: List[str] = []


class HealthResponse(BaseModel):
    """Response from GET /health."""
    status: str
    service: str
    model_loaded: bool
    total_herbs: int
    dataset: str = "Amidha Ayurveda Herb Database"
