"""
Dravya Labs — Ayurvedic Herb Knowledge Microservice
==========================================================
Standalone FastAPI service for herb prediction using a PyTorch model
trained on the Amidha Ayurveda Herb Database (Dravyaguna data).
Secured with API key authentication.

Run:
    uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

Connect from AI backend:
    POST http://localhost:8003/predict
    Headers: { "X-API-Key": "<your-api-key>" }
    Body:    { "query": "digestive Pitta cooling", "top_k": 5 }
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    HerbMatch,
    HerbDetailResponse,
    DoshaFilterRequest,
    DoshaHerbsResponse,
    RasaFilterRequest,
    SafetyInfoResponse,
    HealthResponse,
)
from app.inference import predictor

# ─── Config ───────────────────────────────────────────────────

load_dotenv()

API_KEY = os.getenv("HERB_API_KEY", "")
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "model"))
PORT = int(os.getenv("PORT", 8003))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [HERB-SERVICE] %(levelname)s: %(message)s",
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
    logger.info(f"🚀 Starting Ayurvedic Herb Microservice...")
    logger.info(f"   Model dir: {model_dir}")

    if os.path.exists(os.path.join(model_dir, "herb_model.pth")):
        try:
            predictor.load(model_dir)
            logger.info("🌿 Ayurvedic Model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            logger.info("⚠️ Service running without model — /health will report model_loaded=false")
    else:
        logger.warning(f"⚠️ No herb_model.pth found in {model_dir}")
        logger.info("   Train the model first using python training/train_local.py")

    yield
    logger.info("👋 Ayurvedic Herb Microservice shutting down")


# ─── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="Dravya Labs — Ayurvedic Herb Knowledge Microservice",
    description=(
        "Standalone microservice for Ayurvedic herb prediction using a PyTorch model "
        "trained on authentic Dravyaguna data (Amidha Database). "
        "Secured with API key authentication."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Endpoints ────────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResponse)
async def predict_herbs(
    request: PredictionRequest,
    api_key: str = Depends(verify_api_key),
):
    """Predict the most relevant Ayurvedic herbs for a symptom/property/dosha query."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    logger.info(f"📥 Predict: query='{request.query[:80]}...', top_k={request.top_k}")

    try:
        results = predictor.predict(request.query, request.top_k)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return PredictionResponse(
        query=request.query,
        top_k=request.top_k,
        matches=[HerbMatch(**r) for r in results],
    )


@app.get("/herbs/{name}", response_model=HerbDetailResponse)
async def get_herb_detail(
    name: str,
    api_key: str = Depends(verify_api_key),
):
    """Look up a specific herb by its name."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    info = predictor.get_herb_by_name(name)
    if info is None or not info:
        return HerbDetailResponse(found=False)

    return HerbDetailResponse(
        found=True,
        herb=HerbMatch(
            rank=0,
            confidence=1.0,
            **info,
        ),
    )


@app.post("/herbs/by-dosha", response_model=DoshaHerbsResponse)
async def get_herbs_by_dosha(
    request: DoshaFilterRequest,
    api_key: str = Depends(verify_api_key),
):
    """Filter herbs by the dosha they pacify."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    results = predictor.get_herbs_by_dosha(request.dosha, request.top_k)
    
    return DoshaHerbsResponse(
        dosha=request.dosha,
        count=len(results),
        herbs=[HerbMatch(rank=i+1, confidence=1.0, **r) for i, r in enumerate(results)]
    )


@app.post("/herbs/by-rasa", response_model=DoshaHerbsResponse)
async def get_herbs_by_rasa(
    request: RasaFilterRequest,
    api_key: str = Depends(verify_api_key),
):
    """Filter herbs by Rasa (Taste)."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    results = predictor.get_herbs_by_rasa(request.rasa, request.top_k)
    
    return DoshaHerbsResponse(
        dosha=request.rasa, # Reuse field for simplicity
        count=len(results),
        herbs=[HerbMatch(rank=i+1, confidence=1.0, **r) for i, r in enumerate(results)]
    )


@app.get("/herbs/safety/{name}", response_model=SafetyInfoResponse)
async def get_herb_safety(
    name: str,
    api_key: str = Depends(verify_api_key),
):
    """Retrieve safety flags, contraindications, and aggravated doshas for a given herb."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    info = predictor.get_herb_by_name(name)
    if not info:
        return SafetyInfoResponse(herb_name=name, found=False)

    notes = []
    aggravate = info.get("aggravate_dosha", "")
    virya = info.get("virya", "")
    
    if "Pitta" in aggravate:
        notes.append("Caution: Aggravates Pitta dosha")
    if "Vata" in aggravate:
        notes.append("Caution: Aggravates Vata dosha")
    if "Kapha" in aggravate:
        notes.append("Caution: Aggravates Kapha dosha")
        
    if virya == "Ushna":
        notes.append("Hot potency (Ushna Virya) - avoid in bleeding disorders or extreme heat")
    elif virya == "Sheeta":
        notes.append("Cold potency (Sheeta Virya) - avoid in low digestion or extreme cold/congestion")

    return SafetyInfoResponse(
        herb_name=name,
        found=True,
        virya=virya,
        aggravate_dosha=aggravate,
        contraindications=info.get("contraindications", ""),
        safety_notes=notes,
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check — no API key required."""
    return HealthResponse(
        status="healthy",
        service="Ayurvedic Herb Knowledge Microservice",
        model_loaded=predictor.is_loaded,
        total_herbs=predictor.total_herbs,
    )


# ─── Run ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
