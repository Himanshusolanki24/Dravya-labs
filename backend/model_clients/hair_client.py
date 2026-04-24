"""Hair condition detection — sends image to pre-hosted model."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient


class HairClient(BaseModelClient):
    model_name = "Hair Model"

    def __init__(self) -> None:
        super().__init__()
        self.api_url = settings.HAIR_MODEL_API_URL
        self.api_key = settings.HAIR_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "image_url": data.get("image_url", ""),
            "image_base64": data.get("image_base64", ""),
        }


hair_client = HairClient()
