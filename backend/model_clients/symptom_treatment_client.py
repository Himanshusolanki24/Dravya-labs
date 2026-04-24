"""Client for the Symptom→Treatment microservice."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class SymptomTreatmentClient(BaseModelClient):
    model_name = "Symptom Treatment Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.SYMPTOM_TREATMENT_MODEL_API_URL
        self.api_key = settings.SYMPTOM_TREATMENT_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        """Convert the shared questionnaire data into the expected format."""
        
        # Determine likely symptoms based on the chief complaint
        complaint = str(data.get("chief_complaint", "")).lower()
        
        symptoms_dict = {}
        # Some generic extractions - the model inference engine handles deeper matching
        if "fever" in complaint: symptoms_dict["fever"] = 1
        if "cough" in complaint: symptoms_dict["cough"] = 1
        if "pain" in complaint: symptoms_dict["pain"] = 1
        if "digestion" in complaint or "stomach" in complaint: symptoms_dict["indigestion"] = 1
        if "sleep" in complaint: symptoms_dict["insomnia"] = 1
        
        return {
            "age": int(data.get("age") or 30),
            "gender": str(data.get("gender") or "Male"),
            "chief_complaint": str(data.get("chief_complaint", "")),
            "diet_type": str(data.get("diet_type", "")),
            "stress_level": int(data.get("stress_level") or 5),
            "symptoms": symptoms_dict,
            "top_k": 3
        }


symptom_treatment_client = SymptomTreatmentClient()
