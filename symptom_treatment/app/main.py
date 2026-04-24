"""
Dravya Labs — Symptom→Treatment Microservice
=================================================
Stand-alone FastAPI service for Ayurvedic disease prediction and 
treatment recommendations from patient symptoms.
Secured with API key authentication.

Run:
    uvicorn app.main:app --host 0.0.0.0 --port 8006 --reload

Connect from AI backend:
    POST http://localhost:8006/predict
    Headers: { "X-API-Key": "<your-api-key>" }
    Body:    { "age": 30, "gender": "Male", "symptoms": {...}, ... }
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    SymptomTreatmentRequest,
    SymptomTreatmentResponse,
    DiseasePrediction,
    HealthResponse,
)
from app.inference import predictor

# ─── Config ───────────────────────────────────────────────────

load_dotenv()

API_KEY = os.getenv("SYMPTOM_TREATMENT_API_KEY", "")
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "model"))
PORT = int(os.getenv("PORT", 8006))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SYMPTOM-SERVICE] %(levelname)s: %(message)s",
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
    logger.info("🚀 Starting Symptom→Treatment Microservice...")
    logger.info(f"   Model dir: {model_dir}")

    if os.path.exists(os.path.join(model_dir, "symptom_treatment_model.pth")):
        try:
            predictor.load(model_dir)
            logger.info("🌿 Model and treatments loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            logger.info("⚠️ Service running without model — /health will report model_loaded=false")
    else:
        logger.warning(f"⚠️ No symptom_treatment_model.pth found in {model_dir}")
        logger.info("   Train the model first, then place files in model/")

    yield
    logger.info("👋 Symptom→Treatment Microservice shutting down")


# ─── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="Dravya Labs — Symptom→Treatment Microservice",
    description=(
        "Standalone microservice for predicting Ayurvedic diseases and "
        "recommending treatments based on user symptoms. "
        "Powered by a PyTorch model trained on the AyurGenixAI dataset. "
        "Secured with API key authentication."
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

@app.post("/predict", response_model=SymptomTreatmentResponse)
async def predict_disease(
    request: SymptomTreatmentRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Predict the most likely Ayurvedic diseases and return treatment protocols.
    Requires: X-API-Key header
    """
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Train the model first and place artifacts in model/",
        )

    logger.info(f"📥 Predict: age={request.age}, complaint={request.chief_complaint}, top_k={request.top_k}")

    try:
        results = predictor.predict(
            age=request.age,
            gender=request.gender,
            prakriti=request.prakriti,
            vata_score=request.vata_score or 0.0,
            pitta_score=request.pitta_score or 0.0,
            kapha_score=request.kapha_score or 0.0,
            symptoms=request.symptoms,
            chief_complaint=request.chief_complaint,
            severity=request.severity,
            diet_type=request.diet_type,
            sleep_pattern=request.sleep_pattern,
            stress_level=request.stress_level or 5,
            activity_level=request.activity_level,
            blood_sugar=request.blood_sugar or 0.0,
            bmi=request.bmi or 0.0,
            top_k=request.top_k,
        )
        risk_level = predictor.get_risk_level(results)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return SymptomTreatmentResponse(
        patient_age=request.age,
        patient_gender=request.gender,
        detected_prakriti=request.prakriti or "unknown",
        top_k=request.top_k,
        predictions=[DiseasePrediction(**r) for r in results],
        risk_level=risk_level,
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check — no API key required."""
    return HealthResponse(
        status="healthy",
        service="Symptom→Treatment Microservice",
        model_loaded=predictor.is_loaded,
        total_diseases=predictor.total_diseases,
        total_features=predictor.total_features,
    )


# ─── Run ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
