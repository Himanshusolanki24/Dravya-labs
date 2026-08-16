"""AgentScope-style KnowledgeBase handles for classical, user, and few-shot stores."""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

from app.agentscope_runtime.embeddings import SentenceTransformerEmbedding
from app.agentscope_runtime.helix_store import HelixVDBStore, VectorRecord, VectorSearchResult
from app.core.config import settings

logger = logging.getLogger("dravya.agentscope.knowledge")


class SimpleKnowledge:
    """Narrow KnowledgeBase: embed + insert + search against one collection."""

    def __init__(
        self,
        name: str,
        description: str,
        embedding_model: SentenceTransformerEmbedding,
        vector_store: HelixVDBStore,
        collection: str,
        metadata_filter: Optional[dict[str, Any]] = None,
    ) -> None:
        self.name = name
        self.description = description
        self._embedding_model = embedding_model
        self._vector_store = vector_store
        self._collection = collection
        self._metadata_filter = metadata_filter

    async def add_documents(
        self,
        texts: list[str],
        *,
        document_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        document_id = document_id or uuid.uuid4().hex
        if not texts:
            return document_id
        response = await self._embedding_model(texts)
        records = []
        for index, (text, vector) in enumerate(zip(texts, response.embeddings)):
            payload = {**(metadata or {}), **(self._metadata_filter or {})}
            records.append(
                VectorRecord(
                    vector=vector,
                    document_id=document_id,
                    text=text,
                    metadata=payload,
                    chunk_index=index,
                )
            )
        await self._vector_store.insert(self._collection, records)
        return document_id

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        extra_filter: Optional[dict[str, Any]] = None,
    ) -> list[VectorSearchResult]:
        if not query.strip():
            return []
        response = await self._embedding_model([query])
        if not response.embeddings:
            return []
        metadata_filter = {**(self._metadata_filter or {}), **(extra_filter or {})} or None
        return await self._vector_store.search(
            self._collection,
            response.embeddings[0],
            top_k=top_k,
            metadata_filter=metadata_filter,
        )


class KnowledgeRegistry:
    def __init__(self) -> None:
        embedding = SentenceTransformerEmbedding()
        store = HelixVDBStore()
        self.store = store
        self.embedding = embedding
        self.classical = SimpleKnowledge(
            name="ayurveda_classical",
            description="Classical Ayurvedic protocols, dosha guidance, and safety notes.",
            embedding_model=embedding,
            vector_store=store,
            collection=settings.KB_CLASSICAL_COLLECTION,
        )
        self.user_consultations = SimpleKnowledge(
            name="user_consultations",
            description="Prior consultation summaries for the signed-in user.",
            embedding_model=embedding,
            vector_store=store,
            collection=settings.KB_USER_COLLECTION,
        )
        self.feedback_fewshot = SimpleKnowledge(
            name="feedback_fewshot",
            description="Highly rated past answers used as few-shot style examples.",
            embedding_model=embedding,
            vector_store=store,
            collection=settings.KB_FEWSHOT_COLLECTION,
        )


_registry: Optional[KnowledgeRegistry] = None


def get_knowledge_registry() -> KnowledgeRegistry:
    global _registry
    if _registry is None:
        _registry = KnowledgeRegistry()
    return _registry


def reset_knowledge_registry() -> None:
    global _registry
    _registry = None
