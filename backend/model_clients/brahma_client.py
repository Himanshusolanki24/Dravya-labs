"""Brahma Prakriti Model Client (Port 8005)."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient

class BrahmaClient(BaseModelClient):
    model_name = "Brahma Prakriti Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.BRAHMA_MODEL_API_URL
        self.api_key = settings.BRAHMA_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        # Brahma expects 29 categorical fields.
        # Required in Microservice schema: 'Body Size', 'Body Weight', 'Height', etc.
        
        return {
            "Body Size": str(data.get("body_frame") or "Unknown"),
            "Body Weight": str(data.get("body_weight") or "Unknown"),
            "Height": str(data.get("height") or "Unknown"),
            "Bone Structure": str(data.get("bone_structure") or "Unknown"),
            "Complexion": str(data.get("skin_type") or "Unknown"),
            "General feel of skin": str(data.get("skin_feel") or "Unknown"),
            "Texture of Skin": str(data.get("skin_texture") or "Unknown"),
            "Hair Color": str(data.get("hair_color") or "Unknown"),
            "Appearance of Hair": str(data.get("hair_type") or "Unknown"),
            "Shape of face": str(data.get("face_shape") or "Unknown"),
            "Eyes": str(data.get("eyes") or "Unknown"),
            "Eyelashes": str(data.get("eyelashes") or "Unknown"),
            "Blinking of Eyes": str(data.get("blinking") or "Unknown"),
            "Cheeks": str(data.get("cheeks") or "Unknown"),
            "Nose": str(data.get("nose") or "Unknown"),
            "Teeth and gums": str(data.get("teeth") or "Unknown"),
            "Lips": str(data.get("lips") or "Unknown"),
            "Nails": str(data.get("nails") or "Unknown"),
            "Appetite": str(data.get("appetite") or "Unknown"),
            "Liking tastes": str(data.get("tastes") or "Unknown"),
            "Metabolism Type": str(data.get("metabolism") or "Unknown"),
            "Climate Preference": str(data.get("weather_sensitivity") or "Unknown"),
            "Stress Levels": str(data.get("stress_level") or "Unknown"),
            "Sleep Patterns": str(data.get("sleep_pattern") or "Unknown"),
            "Dietary Habits": str(data.get("diet_type") or "Unknown"),
            "Physical Activity Level": str(data.get("activity_level") or "Unknown"),
            "Water Intake": str(data.get("water_intake") or "Unknown"),
            "Digestion Quality": str(data.get("digestion") or "Unknown"),
            "Skin Sensitivity": str(data.get("skin_sensitivity") or "Unknown")
        }

brahma_client = BrahmaClient()
