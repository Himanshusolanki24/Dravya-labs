"""Vector store: Helix when configured, otherwise an in-memory cosine index.

Implements the AgentScope `VectorStoreBase` operations we need (`add`/`search`
plus collection helpers). Qdrant is used only when `QDRANT_PATH` is set and
Helix is unset.
"""

from __future__ import annotations

import logging
import math
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional

from app.core.config import settings
from app.services.helix_db import HelixDBIndex

logger = logging.getLogger("dravya.agentscope.vdb")


@dataclass
class VectorRecord:
    vector: list[float]
    document_id: str
    text: str
    metadata: dict[str, Any] = field(default_factory=dict)
    chunk_index: int = 0
    record_id: str = field(default_factory=lambda: uuid.uuid4().hex)


@dataclass
class VectorSearchResult:
    score: float
    document_id: str
    text: str
    metadata: dict[str, Any]
    chunk_index: int = 0


def _cosine(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right))
    norm_l = math.sqrt(sum(a * a for a in left))
    norm_r = math.sqrt(sum(b * b for b in right))
    if norm_l == 0 or norm_r == 0:
        return 0.0
    return dot / (norm_l * norm_r)


def _metadata_matches(payload: dict[str, Any], metadata_filter: Optional[dict[str, Any]]) -> bool:
    if not metadata_filter:
        return True
    return all(payload.get(key) == value for key, value in metadata_filter.items())


class HelixVDBStore:
    """Shared vector-store connection with Helix, optional Qdrant, or memory."""

    def __init__(self) -> None:
        self._memory: dict[str, list[VectorRecord]] = {}
        self._helix: Optional[HelixDBIndex] = None
        self._qdrant = None
        if settings.HELIX_DB_API_KEY:
            self._helix = HelixDBIndex(settings.HELIX_DB_COLLECTION)
        elif settings.QDRANT_PATH:
            self._qdrant = self._open_qdrant()

    def _open_qdrant(self):
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.http import models as qmodels

            client = QdrantClient(path=settings.QDRANT_PATH)
            self._qmodels = qmodels
            return client
        except Exception as exc:
            logger.warning("Qdrant fallback unavailable: %s", exc)
            return None

    async def has_collection(self, collection: str) -> bool:
        return True

    async def create_collection(self, collection: str, dimensions: int = 384) -> None:
        self._memory.setdefault(collection, [])
        if self._qdrant is not None:
            try:
                self._qdrant.create_collection(
                    collection_name=collection,
                    vectors_config=self._qmodels.VectorParams(
                        size=dimensions,
                        distance=self._qmodels.Distance.COSINE,
                    ),
                )
            except Exception:
                pass

    async def add(self, collection: str, records: list[VectorRecord]) -> None:
        await self.insert(collection, records)

    async def insert(self, collection: str, records: list[VectorRecord]) -> None:
        bucket = self._memory.setdefault(collection, [])
        bucket.extend(records)
        if self._helix is not None:
            vectors = [
                {
                    "id": record.record_id,
                    "values": record.vector,
                    "metadata": {
                        **record.metadata,
                        "text": record.text,
                        "document_id": record.document_id,
                        "chunk_index": record.chunk_index,
                        "collection": collection,
                    },
                }
                for record in records
            ]
            try:
                self._helix.upsert(vectors)
            except Exception as exc:
                logger.warning("Helix upsert failed; memory index retained: %s", exc)
        if self._qdrant is not None:
            try:
                self._qdrant.upsert(
                    collection_name=collection,
                    points=[
                        self._qmodels.PointStruct(
                            id=record.record_id,
                            vector=record.vector,
                            payload={
                                **record.metadata,
                                "text": record.text,
                                "document_id": record.document_id,
                                "chunk_index": record.chunk_index,
                            },
                        )
                        for record in records
                    ],
                )
            except Exception as exc:
                logger.warning("Qdrant upsert failed: %s", exc)

    async def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        metadata_filter: Optional[dict[str, Any]] = None,
    ) -> list[VectorSearchResult]:
        helix_hits = await self._search_helix(collection, query_vector, top_k, metadata_filter)
        if helix_hits:
            return helix_hits
        if self._qdrant is not None:
            qdrant_hits = await self._search_qdrant(collection, query_vector, top_k, metadata_filter)
            if qdrant_hits:
                return qdrant_hits
        scored: list[VectorSearchResult] = []
        for record in self._memory.get(collection, []):
            payload = {**record.metadata, "text": record.text, "document_id": record.document_id}
            if not _metadata_matches(payload, metadata_filter):
                continue
            scored.append(
                VectorSearchResult(
                    score=_cosine(query_vector, record.vector),
                    document_id=record.document_id,
                    text=record.text,
                    metadata=payload,
                    chunk_index=record.chunk_index,
                )
            )
        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:top_k]

    async def delete(self, collection: str, document_id: str) -> None:
        self._memory[collection] = [
            record for record in self._memory.get(collection, []) if record.document_id != document_id
        ]

    async def _search_helix(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int,
        metadata_filter: Optional[dict[str, Any]],
    ) -> list[VectorSearchResult]:
        if self._helix is None:
            return []
        filt = {"collection": collection, **(metadata_filter or {})}
        try:
            raw = self._helix.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter=filt,
            )
        except Exception as exc:
            logger.warning("Helix query failed: %s", exc)
            return []
        results: list[VectorSearchResult] = []
        for match in raw.get("matches", []):
            meta = match.get("metadata") or {}
            if not _metadata_matches(meta, metadata_filter):
                continue
            results.append(
                VectorSearchResult(
                    score=float(match.get("score") or match.get("similarity") or 0.0),
                    document_id=str(meta.get("document_id") or match.get("id") or ""),
                    text=str(meta.get("text") or ""),
                    metadata=meta,
                    chunk_index=int(meta.get("chunk_index") or 0),
                )
            )
        return results

    async def _search_qdrant(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int,
        metadata_filter: Optional[dict[str, Any]],
    ) -> list[VectorSearchResult]:
        try:
            query_filter = None
            if metadata_filter:
                query_filter = self._qmodels.Filter(
                    must=[
                        self._qmodels.FieldCondition(key=key, match=self._qmodels.MatchValue(value=value))
                        for key, value in metadata_filter.items()
                    ]
                )
            hits = self._qdrant.search(
                collection_name=collection,
                query_vector=query_vector,
                limit=top_k,
                query_filter=query_filter,
            )
        except Exception as exc:
            logger.warning("Qdrant search failed: %s", exc)
            return []
        results: list[VectorSearchResult] = []
        for hit in hits:
            payload = hit.payload or {}
            results.append(
                VectorSearchResult(
                    score=float(hit.score),
                    document_id=str(payload.get("document_id") or hit.id),
                    text=str(payload.get("text") or ""),
                    metadata=payload,
                    chunk_index=int(payload.get("chunk_index") or 0),
                )
            )
        return results
