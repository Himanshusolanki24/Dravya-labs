# app/routes/chat_sessions_route.py
"""
Chat session metadata — CRUD for Supabase `chat_sessions` table.
Each session stores: session_id, user_id, title, created_at, updated_at.
"""

import logging
from datetime import datetime, timezone

import requests as req
from fastapi import APIRouter, HTTPException, Query, status, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import verify_user
from app.services.supabase import insert_row, fetch_row_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat Sessions"])


# ─── Pydantic Models ─────────────────────────────────────────

class ChatSessionOut(BaseModel):
    session_id: str
    title: str
    created_at: str
    updated_at: str


class ChatSessionsList(BaseModel):
    sessions: list[ChatSessionOut]


# ─── Supabase helpers ────────────────────────────────────────

def _headers(prefer: str = "return=representation"):
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }


# ─── Routes ──────────────────────────────────────────────────

@router.get("/sessions", response_model=ChatSessionsList)
async def list_sessions(user_id: str = Depends(verify_user)):
    """List all chat sessions for a user, newest first."""
    try:
        url = (
            f"{settings.SUPABASE_URL}/rest/v1/chat_sessions"
            f"?user_id=eq.{user_id}&select=*&order=updated_at.desc&limit=50"
        )
        resp = req.get(url, headers=_headers())
        resp.raise_for_status()
        rows = resp.json()

        sessions = [
            ChatSessionOut(
                session_id=r["session_id"],
                title=r.get("title", "Untitled Chat"),
                created_at=r.get("created_at", ""),
                updated_at=r.get("updated_at", r.get("created_at", "")),
            )
            for r in rows
        ]
        return ChatSessionsList(sessions=sessions)
    except Exception as e:
        logger.error("Failed to list chat sessions: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat sessions.",
        )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session."""
    try:
        url = (
            f"{settings.SUPABASE_URL}/rest/v1/chat_sessions"
            f"?session_id=eq.{session_id}"
        )
        resp = req.delete(url, headers=_headers("return=minimal"))
        resp.raise_for_status()
        return {"status": "deleted"}
    except Exception as e:
        logger.error("Failed to delete chat session: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session.",
        )


# ─── Utility: called from main.py to upsert session metadata ──

def upsert_chat_session(user_id: str, session_id: str, title: str):
    """Create or update a chat session record in Supabase."""
    try:
        existing = fetch_row_by_id("chat_sessions", "session_id", session_id)
        now = datetime.now(timezone.utc).isoformat()

        if existing:
            url = (
                f"{settings.SUPABASE_URL}/rest/v1/chat_sessions"
                f"?session_id=eq.{session_id}"
            )
            req.patch(url, json={"updated_at": now}, headers=_headers("return=minimal"))
        else:
            insert_row("chat_sessions", {
                "session_id": session_id,
                "user_id": user_id,
                "title": title[:100],
                "created_at": now,
                "updated_at": now,
            })
    except Exception as e:
        logger.warning("upsert_chat_session failed (non-fatal): %s", e)
