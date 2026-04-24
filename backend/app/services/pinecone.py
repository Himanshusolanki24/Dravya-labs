import logging
from app.core.config import settings

logger = logging.getLogger("dravya.pinecone")

pc = None
index = None

try:
    if settings.PINECONE_API_KEY:
        from pinecone import Pinecone
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX)
    else:
        logger.warning("PINECONE_API_KEY not set — Pinecone disabled.")
except Exception as e:
    logger.warning("Pinecone init failed (non-fatal): %s", e)
