"""Diabetes risk assessment — questionnaire-based model."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class DiabetesClient(BaseModelClient):
    model_name = "Diabetes Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.DIABETES_MODEL_API_URL
        self.api_key = settings.DIABETES_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "age": data.get("age"),
            "weight": data.get("weight"),
            "height": data.get("height"),
            "blood_sugar_fasting": data.get("blood_sugar_fasting", ""),
            "blood_sugar_post_meal": data.get("blood_sugar_post_meal", ""),
            "blood_pressure": data.get("blood_pressure", ""),
            "activity_level": data.get("activity_level", ""),
            "diet_type": data.get("diet_type", ""),
            "conditions": data.get("conditions", []),
        }


diabetes_client = DiabetesClient()
