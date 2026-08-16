"""Retrieval helpers used by agents (static injection + agentic tool)."""

from __future__ import annotations

from typing import Any, Optional

from app.agentscope_runtime.knowledge import get_knowledge_registry
from app.core.config import settings


def format_hits(hits) -> list[str]:
    blocks = []
    for hit in hits:
        text = getattr(hit, "text", "") or (hit.get("text") if isinstance(hit, dict) else "")
        if text:
            blocks.append(text)
    return blocks


async def retrieve_knowledge(
    query: str,
    *,
    user_id: Optional[str] = None,
    top_k: Optional[int] = None,
    include_fewshot: bool = False,
    dosha: Optional[str] = None,
) -> list[str]:
    """Search classical + optional user/few-shot knowledge bases."""
    hits = await retrieve_knowledge_blocks(
        query,
        user_id=user_id,
        top_k=top_k,
        include_fewshot=include_fewshot,
        dosha=dosha,
    )
    return format_hits(hits)


async def retrieve_knowledge_blocks(
    query: str,
    *,
    user_id: Optional[str] = None,
    top_k: Optional[int] = None,
    include_fewshot: bool = False,
    dosha: Optional[str] = None,
) -> list[Any]:
    registry = get_knowledge_registry()
    k = top_k or settings.KB_TOP_K
    results = list(await registry.classical.retrieve(query, top_k=k))
    if user_id:
        results.extend(
            await registry.user_consultations.retrieve(
                query, top_k=k, extra_filter={"user_id": user_id}
            )
        )
    if include_fewshot:
        extra = {"dosha": dosha} if dosha else None
        results.extend(await registry.feedback_fewshot.retrieve(query, top_k=k, extra_filter=extra))
    results.sort(key=lambda item: getattr(item, "score", 0.0), reverse=True)
    return results[:k]


def build_rag_context(user_summary: str, knowledge_chunks: list[str]) -> str:
    knowledge_section = "\n\n".join(f"- {chunk}" for chunk in knowledge_chunks) or "- none retrieved"
    return (
        "USER HEALTH SUMMARY:\n"
        f"{user_summary}\n\n"
        "RELEVANT AYURVEDIC KNOWLEDGE:\n"
        f"{knowledge_section}\n\n"
        "Use this knowledge to provide safe, educational wellness guidance.\n"
        "Do NOT diagnose diseases. Do NOT prescribe medicines."
    )
