"""PCOS risk assessment — questionnaire-based model."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class PCOSClient(BaseModelClient):
    model_name = "PCOS Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.PCOS_MODEL_API_URL
        self.api_key = settings.PCOS_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "age": data.get("age"),
            "weight": data.get("weight"),
            "height": data.get("height"),
            "menstrual_cycle": data.get("menstrual_cycle", ""),
            "hair_type": data.get("hair_type", ""),
            "skin_type": data.get("skin_type", ""),
            "conditions": data.get("conditions", []),
        }


pcos_client = PCOSClient()
