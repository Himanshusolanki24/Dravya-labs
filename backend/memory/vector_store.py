"""
Vector Store — Pinecone wrapper for health memory.

store_health_memory()   → save consultation embedding
retrieve_relevant_memory() → fetch past context
"""

import logging
from typing import Any, Optional

from pinecone import Pinecone

from app.core.config import settings

logger = logging.getLogger("dravya.memory.vector_store")

# ── Lazy singleton ────────────────────────────────────────────
_index = None


def _get_index():
    global _index
    if _index is None:
        if not settings.PINECONE_API_KEY or settings.PINECONE_API_KEY.startswith("your-"):
            logger.warning("Pinecone API key not configured — vector store disabled.")
            return None
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        # Pointing to the specific user-provided serverless index
        _index = pc.Index("dravya-labs")
    return _index


def store_health_memory(
    user_id: str,
    summary_text: str,
    metadata: Optional[dict[str, Any]] = None,
) -> bool:
    """
    Embed a consultation summary and upsert to Pinecone.
    Returns True on success, False on failure.
    """
    idx = _get_index()
    if idx is None:
        return False

    try:
        # We rely on Pinecone's native integrated 'llama-text-embed-v2' via the inference API
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        embedding_resp = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=[summary_text],
            parameters={"input_type": "passage", "truncate": "END"}
        )
        embedding = embedding_resp[0].values

        meta = {"user_id": user_id, "text": summary_text}
        if metadata:
            meta.update(metadata)

        idx.upsert(
            vectors=[
                {
                    "id": f"{user_id}-{_ts()}",
                    "values": embedding,
                    "metadata": meta,
                }
            ]
        )
        logger.info("Stored health memory for %s", user_id)
        return True
    except Exception as e:
        logger.warning("store_health_memory failed: %s", e)
        return False


def retrieve_relevant_memory(
    user_id: str,
    query_text: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Retrieve past consultation memories relevant to the query.
    Returns list of metadata dicts.
    """
    idx = _get_index()
    if idx is None:
        return []

    try:
        # Generate query embedding against the Llama v2 space
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        embedding_resp = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=[query_text],
            parameters={"input_type": "query", "truncate": "END"}
        )
        embedding = embedding_resp[0].values

        results = idx.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
            filter={"user_id": {"$eq": user_id}},
        )
        return [
            match.get("metadata", {})
            for match in results.get("matches", [])
        ]
    except Exception as e:
        logger.warning("retrieve_relevant_memory failed: %s", e)
        return []


def _ts() -> str:
    from datetime import datetime
    return datetime.utcnow().strftime("%Y%m%d%H%M%S")
