"""
Async Supabase (PostgREST) client with a shared connection pool.

Why this exists
---------------
The legacy `app/services/supabase.py` uses the synchronous `requests`
library inside async FastAPI handlers. Every call blocks the event loop,
so one slow Supabase round-trip stalls ALL concurrent requests.

This module:
  • uses httpx.AsyncClient (non-blocking)
  • keeps ONE shared client alive (HTTP keep-alive / connection pooling)
    instead of opening a new TCP+TLS connection per call
  • exposes small helpers used by the Data Flywheel (feedback + few-shot)

New routes should import from here, not from the sync module.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("dravya.supabase_async")

_HEADERS = {
    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# ── Shared, pooled client (created once, reused for the process lifetime) ──
_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=f"{settings.SUPABASE_URL}/rest/v1",
            headers=_HEADERS,
            timeout=15.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        )
    return _client


async def close_client() -> None:
    """Call on FastAPI shutdown to release pooled sockets cleanly."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def insert_row(table: str, data: dict[str, Any]) -> Optional[dict]:
    """Insert a row and return the created record."""
    client = get_client()
    resp = await client.post(
        f"/{table}",
        json=data,
        headers={"Prefer": "return=representation"},
    )
    resp.raise_for_status()
    rows = resp.json()
    return rows[0] if rows else None


async def select_rows(
    table: str,
    *,
    filters: Optional[dict[str, str]] = None,
    select: str = "*",
    limit: int = 100,
    order: Optional[str] = None,
) -> list[dict]:
    """
    Select rows with simple PostgREST filters.

    `filters` values must include the operator, e.g. {"feedback_score": "eq.1"}.
    """
    params: dict[str, str] = {"select": select, "limit": str(limit)}
    if filters:
        params.update(filters)
    if order:
        params["order"] = order

    client = get_client()
    resp = await client.get(f"/{table}", params=params)
    resp.raise_for_status()
    return resp.json()
