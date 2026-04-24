"""Herbs Knowledge Model Client (Port 8003)."""

from typing import Any
from app.core.config import settings
from model_clients.base_client import BaseModelClient

class HerbsClient(BaseModelClient):
    model_name = "Ayurvedic Herbs Model"

    def __init__(self) -> None:
        super().__init__()
        # Use base url to construct specific endpoint paths.
        base_url = settings.HERBS_MODEL_API_URL.rstrip('/')
        if not base_url.endswith("/predict"):
             self.api_url = f"{base_url}/predict"
        else:
             self.api_url = base_url
             
        self.api_key = settings.HERBS_MODEL_API_KEY

    def _build_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Maps the conversational orchestrator traits to the rigid 
        categorical inputs expected by the Herbs microservice.
        """
        # Microservice expects 'query' (str) and 'top_k' (int)
        query = f"{data.get('chief_complaint', '')} {data.get('prakriti', '')} {data.get('action', '')}".strip()
        if not query:
            query = "general wellness"
            
        return {
            "query": query,
            "top_k": int(data.get("top_k", 5))
        }

herbs_client = HerbsClient()
