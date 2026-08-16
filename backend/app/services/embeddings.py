# app/services/embeddings.py

import hashlib
import os

from app.core.config import settings

# Load model once at startup
_model = None


def _hash_embedding(text: str, dimensions: int = 384) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return [(digest[index % len(digest)] / 255.0) for index in range(dimensions)]


def _use_hash_embeddings() -> bool:
    return os.getenv("DRAVYA_HASH_EMBEDDINGS", "").lower() in ("1", "true", "yes")


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(settings.SENTENCE_TRANSFORMER_MODEL)
    return _model


def generate_embedding(text: str) -> list[float]:
    """
    Generate a dense vector embedding from text using sentence-transformers.
    Returns a list of floats (384-dim for all-MiniLM-L6-v2).
    """
    if _use_hash_embeddings():
        return _hash_embedding(text)
    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_text(text: str) -> list[float]:
    """Alias used by RAG retrieval helpers."""
    return generate_embedding(text)


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if _use_hash_embeddings():
        return [_hash_embedding(text) for text in texts]
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return [vector.tolist() for vector in vectors]
