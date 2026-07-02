"""
Feedback Route — the Data Flywheel entry point.

Every AI response in the chat UI carries 👍 / 👎 / "what was wrong?".
When the user reacts, the FULL context is captured (not just the score),
so it can power two things:

  1. Short-term  → Dynamic Few-Shot Prompting (see few_shot_retriever.py).
                   Highly-rated answers are injected into future prompts.
  2. Long-term   → RLHF export (scripts/export_feedback.py) for fine-tuning
                   a cheap open-source model and re-training the ML models.

Table: `feedback` (see backend/migrations/002_feedback.sql).
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import verify_user
from app.services.supabase_async import insert_row, select_rows

logger = logging.getLogger("dravya.feedback")

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


class FeedbackInput(BaseModel):
    session_id: str
    user_prompt: str
    ai_response: str
    feedback_score: int = Field(..., description="+1 (👍) or -1 (👎)")
    feedback_text: str = ""
    # Which ML models fired + what they returned, latency, errors, etc.
    orchestrator_logs: dict = Field(default_factory=dict)
    # prakriti/vikriti/severity at the time of the response
    dosha_context: dict = Field(default_factory=dict)


@router.post("")
async def submit_feedback(
    payload: FeedbackInput,
    user_id: str = Depends(verify_user),
):
    """Store one feedback event with its full context."""
    if payload.feedback_score not in (-1, 1):
        raise HTTPException(status_code=422, detail="feedback_score must be +1 or -1")

    row = {
        "user_id": user_id,
        "session_id": payload.session_id,
        "user_prompt": payload.user_prompt,
        "ai_response": payload.ai_response,
        "orchestrator_logs": payload.orchestrator_logs,
        "feedback_score": payload.feedback_score,
        "feedback_text": payload.feedback_text or None,
        "dosha_context": payload.dosha_context,
    }

    try:
        created = await insert_row("feedback", row)
    except Exception as e:  # non-fatal: never break the UX over feedback
        logger.warning("Feedback insert failed: %s", e)
        raise HTTPException(status_code=502, detail="Could not store feedback")

    logger.info(
        "Feedback stored: user=%s score=%+d session=%s",
        user_id, payload.feedback_score, payload.session_id,
    )
    return {"status": "stored", "id": (created or {}).get("id")}


@router.get("/stats")
async def feedback_stats(user_id: str = Depends(verify_user)):
    """Lightweight quality signal: how many 👍 vs 👎 this user has given."""
    up = await select_rows(
        "feedback",
        filters={"user_id": f"eq.{user_id}", "feedback_score": "eq.1"},
        select="id",
        limit=1000,
    )
    down = await select_rows(
        "feedback",
        filters={"user_id": f"eq.{user_id}", "feedback_score": "eq.-1"},
        select="id",
        limit=1000,
    )
    return {"positive": len(up), "negative": len(down)}
