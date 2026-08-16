"""Embedding adapter that reuses the project's sentence-transformers model.

Mirrors AgentScope `EmbeddingModelBase.__call__` enough for our KnowledgeBase
handle: `dimensions`, `supports_multimodal`, and async batch embed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.core.config import settings
from app.services.embeddings import generate_embedding, generate_embeddings


@dataclass
class EmbeddingResponse:
    embeddings: list[list[float]]


class SentenceTransformerEmbedding:
    """AgentScope-compatible embedding model backed by local MiniLM."""

    supports_multimodal = False

    def __init__(self, dimensions: int = 384) -> None:
        self.model = settings.SENTENCE_TRANSFORMER_MODEL
        self.dimensions = dimensions

    async def __call__(self, inputs: list[Any], **_kwargs: Any) -> EmbeddingResponse:
        texts: list[str] = []
        for item in inputs:
            if isinstance(item, str):
                texts.append(item)
            elif hasattr(item, "text"):
                texts.append(str(item.text))
            elif isinstance(item, dict) and "text" in item:
                texts.append(str(item["text"]))
            else:
                texts.append(str(item))
        if not texts:
            return EmbeddingResponse(embeddings=[])
        if len(texts) == 1:
            return EmbeddingResponse(embeddings=[generate_embedding(texts[0])])
        return EmbeddingResponse(embeddings=generate_embeddings(texts))
