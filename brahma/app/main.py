import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import BrahmaRequest, BrahmaResponse, HealthResponse, DoshaMatch
from .inference import BrahmaPredictor

load_dotenv()

API_KEY = os.getenv("BRAHMA_API_KEY", "")
MODEL_DIR = os.getenv("MODEL_DIR", "model")
PORT = int(os.getenv("PORT", 8005))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
predictor = BrahmaPredictor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_dir = os.path.abspath(MODEL_DIR)
    logger.info(f"🚀 Starting Brahma Prakriti Microservice...")
    
    if os.path.exists(os.path.join(model_dir, "brahma_model.pth")):
        try:
            predictor.load(model_dir)
            logger.info("🕉️ Brahma Model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load Brahma model: {e}")
    else:
        logger.warning(f"⚠️ No brahma_model.pth found in {model_dir}. Please train first.")
    
    yield
    logger.info("👋 Brahma Microservice shutting down")

app = FastAPI(
    title="Brahma Prakriti Knowledge API",
    description="Knowledge-based PyTorch classification model for Ayurvedic Dosha",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key. Set X-API-Key header.")
    return api_key

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Brahma Prakriti API"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=predictor.is_loaded,
        version="1.0.0"
    )

@app.post("/predict", response_model=BrahmaResponse)
async def predict_dosha(
    request: BrahmaRequest, 
    api_key: str = Depends(verify_api_key)
):
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Brahma model not loaded.")

    try:
        # Convert Request model to dictionary replacing with actual string inputs
        features_dict = request.model_dump(by_alias=True)
        results = predictor.predict(features_dict)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return BrahmaResponse(
        primary_dosha=results[0]['dosha'],
        matches=[DoshaMatch(**r) for r in results]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
