import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import DietRequest, DietResponse, HealthResponse, DietMatch
from .inference import DietPredictor

# Load environment variables
load_dotenv()

# Configuration
API_KEY = os.getenv("DIETPLAIN_API_KEY", "")
MODEL_DIR = os.getenv("MODEL_DIR", "model")
PORT = int(os.getenv("PORT", 8004))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Global Predictor Instance
predictor = DietPredictor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: loads the PyTorch model into memory on startup."""
    model_dir = os.path.abspath(MODEL_DIR)
    logger.info(f"🚀 Starting Dietplain Microservice...")
    logger.info(f"   Model dir: {model_dir}")

    if os.path.exists(os.path.join(model_dir, "dietplain_model.pth")):
        try:
            predictor.load(model_dir)
            logger.info("🥗 Dietplain Model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load Dietplain model: {e}")
    else:
        logger.warning(f"⚠️ No dietplain_model.pth found in {model_dir}. Please train first.")
    
    yield
    logger.info("👋 Dietplain Microservice shutting down")


# Initialize FastAPI App
app = FastAPI(
    title="Dietplain Knowledge System API",
    description="Knowledge-based PyTorch model for nutritional food recommendation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != API_KEY:
        raise HTTPException(
            status_code=403, 
            detail="Invalid or missing API key. Set X-API-Key header."
        )
    return api_key


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Dietplain Knowledge API. Please use /docs for documentation."}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=predictor.is_loaded,
        version="1.0.0"
    )


@app.post("/predict", response_model=DietResponse)
async def predict_food(
    request: DietRequest, 
    api_key: str = Depends(verify_api_key)
):
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Train the model first and place artifacts in model/"
        )

    logger.info(f"📥 Predict Diet: Meal={request.meal_type}, Cal={request.calories}")

    try:
        results = predictor.predict(
            meal_type=request.meal_type,
            calories=request.calories,
            protein=request.protein,
            carbs=request.carbs,
            fat=request.fat,
            fiber=request.fiber,
            sugars=request.sugars,
            sodium=request.sodium,
            cholesterol=request.cholesterol,
            water_intake=request.water_intake,
            top_k=request.top_k
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return DietResponse(
        meal_context=request.meal_type,
        matches=[DietMatch(**r) for r in results]
    )

@app.get("/food/{name}")
async def get_food_info(name: str, api_key: str = Depends(verify_api_key)):
    """Look up nutritional info for a specific food item in the knowledge base."""
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded.")
        
    info = predictor._lookup(name)
    if not info:
        raise HTTPException(status_code=404, detail=f"Food '{name}' not found in knowledge base.")
        
    return {"food_name": name, "info": info}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
