"""Obesity risk assessment — questionnaire-based model."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class ObesityClient(BaseModelClient):
    model_name = "Obesity Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.OBESITY_MODEL_API_URL
        self.api_key = settings.OBESITY_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "age": data.get("age"),
            "weight": data.get("weight"),
            "height": data.get("height"),
            "activity_level": data.get("activity_level", ""),
            "diet_type": data.get("diet_type", ""),
            "sleep_duration": data.get("sleep_duration", ""),
            "stress_level": data.get("stress_level"),
        }


obesity_client = ObesityClient()
