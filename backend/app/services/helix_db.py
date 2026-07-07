import logging
import httpx
from app.core.config import settings

logger = logging.getLogger("dravya.helix_db")

class HelixDBIndex:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.api_url = settings.HELIX_DB_API_URL
        self.headers = {
            "Authorization": f"Bearer {settings.HELIX_DB_API_KEY}",
            "Content-Type": "application/json"
        }
        
    def upsert(self, vectors: list):
        if not settings.HELIX_DB_API_KEY:
            logger.warning("HELIX_DB_API_KEY not set. Upsert skipped.")
            return
        
        url = f"{self.api_url}/collections/{self.collection_name}/upsert"
        try:
            # Sync call for simplicity, similar to Pinecone SDK
            with httpx.Client() as client:
                resp = client.post(url, json={"vectors": vectors}, headers=self.headers)
                resp.raise_for_status()
        except Exception as e:
            logger.error(f"Helix DB upsert failed: {e}")
            raise
            
    def query(self, vector: list, top_k: int = 5, include_metadata: bool = True, filter: dict = None):
        if not settings.HELIX_DB_API_KEY:
            logger.warning("HELIX_DB_API_KEY not set. Query returning empty.")
            return {"matches": []}
            
        url = f"{self.api_url}/collections/{self.collection_name}/query"
        payload = {
            "vector": vector,
            "top_k": top_k,
            "include_metadata": include_metadata
        }
        if filter:
            payload["filter"] = filter
            
        try:
            with httpx.Client() as client:
                resp = client.post(url, json=payload, headers=self.headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(f"Helix DB query failed: {e}")
            return {"matches": []}

index = HelixDBIndex(settings.HELIX_DB_COLLECTION)
