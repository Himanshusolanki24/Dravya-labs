"""
Vector Store — Helix DB wrapper for health memory.

store_health_memory()   → save consultation embedding
retrieve_relevant_memory() → fetch past context
"""

import logging
from typing import Any, Optional

from app.core.config import settings
from app.services.helix_db import HelixDBIndex
from app.services.embeddings import generate_embedding

logger = logging.getLogger("dravya.memory.vector_store")

# ── Lazy singleton ────────────────────────────────────────────
_index = None

def _get_index():
    global _index
    if _index is None:
        if not settings.HELIX_DB_API_KEY:
            logger.warning("Helix DB API key not configured — vector store disabled.")
            return None
        _index = HelixDBIndex(settings.HELIX_DB_COLLECTION)
    return _index


def store_health_memory(
    user_id: str,
    summary_text: str,
    metadata: Optional[dict[str, Any]] = None,
) -> bool:
    """
    Embed a consultation summary and upsert to Helix DB.
    Returns True on success, False on failure.
    """
    idx = _get_index()
    if idx is None:
        return False

    try:
        embedding = generate_embedding(summary_text)

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
        embedding = generate_embedding(query_text)

        results = idx.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
            filter={"user_id": user_id},
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
