"""Dietplain Nutrition Model Client (Port 8004)."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient

class DietplainClient(BaseModelClient):
    model_name = "Dietplain Nutrition Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.DIETPLAIN_MODEL_API_URL
        self.api_key = settings.DIETPLAIN_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        
        # We supply standardized dietary macros to match what Dietplain expects
        # The AI orchestrator can pass custom numerical targets, or we fallback to generic
        
        return {
            "meal_type": data.get("meal_type", "Lunch"), # Default if unprovided
            "calories": float(data.get("calories", 500.0)),
            "protein": float(data.get("protein", 20.0)),
            "carbs": float(data.get("carbs", 50.0)),
            "fat": float(data.get("fat", 15.0)),
            "fiber": float(data.get("fiber", 5.0)),
            "sugars": float(data.get("sugars", 10.0)),
            "sodium": float(data.get("sodium", 400.0)),
            "cholesterol": float(data.get("cholesterol", 50.0)),
            "water_intake": float(data.get("water_intake", 1.0)),
            "top_k": int(data.get("top_k", 5)) # Request top 5 matching foods
        }

dietplain_client = DietplainClient()
