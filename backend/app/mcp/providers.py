"""HTTP adapters for Notion, Obsidian Local REST, and the local Ayurveda vault."""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger("dravya.mcp")

_KNOWLEDGE_DIR = Path(__file__).resolve().parents[2] / "knowledge"
_MAX_SNIPPET = 500
_MAX_HITS = 3


def _trim(text: str, limit: int = _MAX_SNIPPET) -> str:
    text = re.sub(r"\s+", " ", (text or "").strip())
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


async def search_notion(token: str, query: str) -> list[str]:
    if not token or not query.strip():
        return []
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://api.notion.com/v1/search",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json",
                },
                json={"query": query[:200], "page_size": _MAX_HITS},
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("Notion search failed: %s", exc)
        return []

    hits: list[str] = []
    for item in data.get("results") or []:
        props = item.get("properties") or {}
        title = ""
        for value in props.values():
            if value.get("type") == "title":
                bits = value.get("title") or []
                title = "".join(part.get("plain_text", "") for part in bits)
                break
        if not title:
            title = (item.get("url") or "Notion page")[:80]
        hits.append(_trim(f"Notion: {title}"))
    return hits


async def search_obsidian(base_url: str, api_key: str, query: str) -> list[str]:
    if not base_url or not api_key or not query.strip():
        return []
    root = base_url.rstrip("/")
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        async with httpx.AsyncClient(timeout=8.0, verify=False) as client:
            resp = await client.post(
                f"{root}/search/simple/",
                headers=headers,
                params={"query": query[:200], "contextLength": 120},
            )
            if resp.status_code >= 400:
                resp = await client.get(
                    f"{root}/search/simple/",
                    headers=headers,
                    params={"query": query[:200]},
                )
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("Obsidian search failed: %s", exc)
        return []

    hits: list[str] = []
    rows = data if isinstance(data, list) else data.get("results") or []
    for row in rows[:_MAX_HITS]:
        if isinstance(row, str):
            hits.append(_trim(f"Obsidian: {row}"))
            continue
        name = row.get("filename") or row.get("path") or "note"
        snippet = row.get("matches") or row.get("context") or row.get("content") or ""
        if isinstance(snippet, list):
            snippet = " ".join(str(part) for part in snippet[:3])
        hits.append(_trim(f"Obsidian {name}: {snippet}"))
    return hits


def search_knowledge(query: str) -> list[str]:
    """Local vault search (filesystem MCP analog) over backend/knowledge."""
    if not query.strip() or not _KNOWLEDGE_DIR.exists():
        return []
    terms = [t.lower() for t in re.findall(r"[a-zA-Z]{3,}", query)[:8]]
    if not terms:
        return []
    hits: list[str] = []
    for path in sorted(_KNOWLEDGE_DIR.glob("*.md")):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        lower = text.lower()
        if not any(term in lower for term in terms):
            continue
        for para in re.split(r"\n\s*\n", text):
            if any(term in para.lower() for term in terms):
                hits.append(_trim(f"{path.stem}: {para}"))
                break
        if len(hits) >= _MAX_HITS:
            break
    return hits


async def gather_mcp_context(
    query: str,
    *,
    notion_token: Optional[str] = None,
    obsidian_url: Optional[str] = None,
    obsidian_key: Optional[str] = None,
    knowledge: bool = True,
) -> str:
    chunks: list[str] = []
    if knowledge:
        chunks.extend(search_knowledge(query))
    if notion_token:
        chunks.extend(await search_notion(notion_token, query))
    if obsidian_url and obsidian_key:
        chunks.extend(await search_obsidian(obsidian_url, obsidian_key, query))
    if not chunks:
        return ""
    return "\n".join(f"- {item}" for item in chunks)
