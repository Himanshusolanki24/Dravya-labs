"""Autoimmune risk assessment — questionnaire-based model."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class AutoimmuneClient(BaseModelClient):
    model_name = "Autoimmune Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.AUTOIMMUNE_MODEL_API_URL
        self.api_key = settings.AUTOIMMUNE_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        # DiagnosisRequest expects age, gender, and optionally symptoms/antibodies dicts.
        return {
            "age": int(data.get("age") or 30),
            "gender": str(data.get("gender") or "Male"),
            "sickness_duration_months": 0.0,
            "symptoms": {
                "fatigue": 1 if "fatigue" in str(data.get("chief_complaint", "")).lower() else 0,
                "joint_pain": 1 if "pain" in str(data.get("chief_complaint", "")).lower() else 0,
                "fever": 1 if "fever" in str(data.get("chief_complaint", "")).lower() else 0,
            },
            "top_k": 5
        }


autoimmune_client = AutoimmuneClient()
