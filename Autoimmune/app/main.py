"""
Dravya Labs — Autoimmune Knowledge Microservice
=================================================
Standalone FastAPI service for autoimmune disorder prediction from patient data.
Secured with API key authentication.

Run:
    uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

Connect from AI backend:
    POST https://<host>/predict
    Headers: { "X-API-Key": "<your-api-key>" }
    Body:    { "age": 45, "gender": "Female", "symptoms": {...}, ... }
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    DiagnosisRequest,
    DiagnosisResponse,
    DiagnosisMatch,
    DiseaseDetailResponse,
    HealthResponse,
)
from app.inference import predictor

# ─── Config ───────────────────────────────────────────────────

load_dotenv()

API_KEY = os.getenv("AUTOIMMUNE_API_KEY", "")
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "model"))
PORT = int(os.getenv("PORT", 8003))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [AUTOIMMUNE-SERVICE] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─── API Key Security ────────────────────────────────────────

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    """Validate the API key from the request header."""
    if not api_key or api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API key. Set X-API-Key header.",
        )
    return api_key


# ─── Lifespan (startup/shutdown) ─────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model on startup."""
    model_dir = os.path.abspath(MODEL_DIR)
    logger.info("🚀 Starting Autoimmune Microservice...")
    logger.info(f"   Model dir: {model_dir}")

    if os.path.exists(os.path.join(model_dir, "autoimmune_model.pth")):
        try:
            predictor.load(model_dir)
            logger.info("🧬 Model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            logger.info("⚠️ Service running without model — /health will report model_loaded=false")
    else:
        logger.warning(f"⚠️ No autoimmune_model.pth found in {model_dir}")
        logger.info("   Train the model first using the Colab notebook, then place files in model/")

    yield
    logger.info("👋 Autoimmune Microservice shutting down")


# ─── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="Dravya Labs — Autoimmune Knowledge Microservice",
    description=(
        "Standalone microservice for autoimmune disorder prediction using a PyTorch model "
        "trained on patient lab data, symptoms, and antibody markers. "
        "Secured with API key authentication. "
        "Connect from the AI backend using the X-API-Key header."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Endpoints ────────────────────────────────────────────────

@app.post("/predict", response_model=DiagnosisResponse)
async def predict_disorder(
    request: DiagnosisRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Predict the most likely autoimmune disorders for a patient.

    Requires: X-API-Key header
    """
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Train the model first and place artifacts in model/",
        )

    logger.info(f"📥 Predict: age={request.age}, gender={request.gender}, top_k={request.top_k}")

    # Build lab_values dict from request fields
    lab_values = {}
    lab_fields = [
        "rbc_count", "hemoglobin", "hematocrit", "mcv", "mch", "mchc",
        "rdw", "reticulocyte_count", "wbc_count", "neutrophils",
        "lymphocytes", "monocytes", "eosinophils", "basophils",
        "plt_count", "mpv", "ana", "esbach", "mbl_level", "esr",
        "c3", "c4", "crp",
    ]
    for field in lab_fields:
        val = getattr(request, field, None)
        if val is not None:
            lab_values[field] = val

    try:
        results = predictor.predict(
            age=request.age,
            gender=request.gender,
            sickness_duration=request.sickness_duration_months,
            lab_values=lab_values if lab_values else None,
            symptoms=request.symptoms,
            antibodies=request.antibodies,
            top_k=request.top_k,
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return DiagnosisResponse(
        patient_age=request.age,
        patient_gender=request.gender,
        top_k=request.top_k,
        matches=[DiagnosisMatch(**r) for r in results],
    )


@app.get("/diseases/{disease_name}", response_model=DiseaseDetailResponse)
async def get_disease_detail(
    disease_name: str,
    api_key: str = Depends(verify_api_key),
):
    """
    Look up a specific autoimmune disorder by name.

    Requires: X-API-Key header
    """
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    info = predictor.get_disease_by_name(disease_name)
    if info is None:
        return DiseaseDetailResponse(found=False)

    return DiseaseDetailResponse(
        found=True,
        disease=DiagnosisMatch(
            rank=0,
            disease_name=disease_name,
            confidence=1.0,
            **info,
        ),
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check — no API key required."""
    return HealthResponse(
        status="healthy",
        service="Autoimmune Knowledge Microservice",
        model_loaded=predictor.is_loaded,
        total_diseases=predictor.total_diseases,
    )


# ─── Run ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
