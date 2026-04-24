from pydantic import BaseModel
from typing import List, Optional

class Prediction(BaseModel):
    disease: str
    confidence: float
    description: Optional[str] = None

class PredictionResponse(BaseModel):
    predictions: List[Prediction]
    disclaimer: str = "This AI system is for educational purposes only and not a medical diagnosis."
