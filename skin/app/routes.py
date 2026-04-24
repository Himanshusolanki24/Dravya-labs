from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
from app.inference import predictor
from app.schemas import PredictionResponse
from utils.logger import logger

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint — shows model status."""
    status = predictor.status
    return {
        "status": "healthy",
        "model": status,
    }


@router.post("/predict", response_model=PredictionResponse)
async def predict_skin_disease(file: UploadFile = File(...)):
    """
    Predict skin disease from an uploaded image.
    Returns top-3 predictions with confidence scores.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    if not predictor.is_ready:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first.",
        )

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        results = predictor.predict(image, top_k=3)

        return PredictionResponse(predictions=results)

    except RuntimeError as e:
        logger.error(f"Prediction failed (model error): {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
