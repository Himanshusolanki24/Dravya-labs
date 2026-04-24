# app/services/embeddings.py

from sentence_transformers import SentenceTransformer

# Load model once at startup
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embedding(text: str) -> list[float]:
    """
    Generate a dense vector embedding from text using sentence-transformers.
    Returns a list of floats (384-dim for all-MiniLM-L6-v2).
    """
    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()
