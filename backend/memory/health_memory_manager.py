"""
Health Memory Manager — orchestrates Supabase + Pinecone memory.

Before agents:  retrieve profile + past consultations
After pipeline:  save report to Supabase + embed summary to Pinecone
"""

import json
import logging
from datetime import datetime
from typing import Any

import httpx

from app.core.config import settings
from memory.vector_store import store_health_memory, retrieve_relevant_memory

logger = logging.getLogger("dravya.memory.manager")

# ── Supabase REST helpers ─────────────────────────────────────

_HEADERS = {
    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "",
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or ''}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


async def retrieve_health_context(user_id: str) -> dict[str, Any]:
    """
    Gather all prior context for a user before agent execution.

    Returns dict with keys:
      "profile"     — Supabase user_health_profiles row (if any)
      "history"     — recent analysis_history rows
      "memories"    — Pinecone vector matches
    """
    context: dict[str, Any] = {
        "profile": None,
        "history": [],
        "memories": [],
    }

    base = settings.SUPABASE_URL

    # 1. Fetch health profile
    try:
        url = f"{base}/rest/v1/user_health_profiles?user_id=eq.{user_id}&select=*&limit=1"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=_HEADERS)
        if resp.status_code == 200:
            rows = resp.json()
            if rows:
                context["profile"] = rows[0]
    except Exception as e:
        logger.warning("Failed to fetch health profile: %s", e)

    # 2. Fetch recent analysis history
    try:
        url = (
            f"{base}/rest/v1/analysis_history"
            f"?user_id=eq.{user_id}&select=*&order=created_at.desc&limit=5"
        )
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=_HEADERS)
        if resp.status_code == 200:
            context["history"] = resp.json()
    except Exception as e:
        logger.warning("Failed to fetch analysis history: %s", e)

    # 3. Retrieve Pinecone memories
    try:
        context["memories"] = retrieve_relevant_memory(
            user_id=user_id,
            query_text="health consultation history",
            top_k=5,
        )
    except Exception as e:
        logger.warning("Failed to retrieve vector memories: %s", e)

    return context


async def save_consultation(
    user_id: str,
    report: dict[str, Any],
) -> bool:
    """
    Persist consultation results after pipeline completion.

    1. Insert row into Supabase `analysis_history`
    2. Embed summary text into Pinecone
    """
    base = settings.SUPABASE_URL
    saved = False

    # 1. Save to Supabase
    try:
        row = {
            "user_id": user_id,
            "report_json": json.dumps(report),
            "created_at": datetime.utcnow().isoformat(),
        }
        url = f"{base}/rest/v1/analysis_history"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=row, headers=_HEADERS)
        if resp.status_code in (200, 201):
            saved = True
            logger.info("Analysis saved to Supabase for %s", user_id)
        else:
            logger.warning("Supabase insert returned %s: %s", resp.status_code, resp.text)
    except Exception as e:
        logger.warning("Failed to save to Supabase: %s", e)

    # 2. Store embedding in Pinecone
    try:
        summary = _build_summary_text(report)
        store_health_memory(
            user_id=user_id,
            summary_text=summary,
            metadata={
                "type": "consultation",
                "prakriti": report.get("prakriti", {}).get("dominant_dosha", ""),
                "verdict": report.get("safety", {}).get("verdict", ""),
            },
        )
    except Exception as e:
        logger.warning("Failed to store vector memory: %s", e)

    return saved


def _build_summary_text(report: dict[str, Any]) -> str:
    """Create a concise text summary for embedding."""
    prakriti = report.get("prakriti", {})
    vikriti = report.get("vikriti", {})
    herbs = report.get("herbs", {})
    safety = report.get("safety", {})

    parts = [
        f"Constitution: {prakriti.get('dominant_dosha', 'unknown')}",
        f"Imbalance: {', '.join(vikriti.get('aggravated_doshas', []))}",
        f"Severity: {vikriti.get('severity_score', 0)}/10",
        f"Herbs recommended: {', '.join(h.get('name', '') for h in herbs.get('herbs', []))}",
        f"Safety: {safety.get('verdict', 'unknown')}",
    ]
    return ". ".join(parts)
