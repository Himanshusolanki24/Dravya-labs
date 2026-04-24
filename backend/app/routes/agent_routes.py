"""
Agent Routes — FastAPI endpoints for the multi-agent pipeline.

POST /api/generate-plan   → full orchestrator pipeline
GET  /api/history/{user_id} → analysis history
POST /api/upload-image    → save image reference
"""

import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import verify_user
from agents.schemas import (
    GeneratePlanRequest,
    GeneratePlanResponse,
    SharedState,
    UserProfile,
)
from agents.orchestrator_agent import run_pipeline

logger = logging.getLogger("dravya.routes.agents")

router = APIRouter(prefix="/api", tags=["agents"])

# ── Supabase headers ──────────────────────────────────────────
_HEADERS = {
    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or "",
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or ''}",
    "Content-Type": "application/json",
}


# ═══════════════════════════════════════════════════════════════
# POST /api/generate-plan
# ═══════════════════════════════════════════════════════════════

@router.post("/generate-plan", response_model=GeneratePlanResponse)
async def generate_plan(
    payload: GeneratePlanRequest,
    user_id: str = Depends(verify_user),
):
    """
    Run the full multi-agent pipeline:
    Memory → Symptoms → Prakriti → Vikriti → Dravya → Ahara → Safety → Save
    """
    # Override user_id from JWT (don't trust the payload)
    payload.user_profile.user_id = user_id

    # Build SharedState from the request
    state = SharedState(
        user_profile=payload.user_profile,
        health_metrics=payload.health_metrics or SharedState().health_metrics,
        diet_info=payload.diet_info or SharedState().diet_info,
        medical_history=payload.medical_history or SharedState().medical_history,
        symptoms_input=payload.symptoms_input or SharedState().symptoms_input,
        images=payload.images,
    )

    try:
        response = await run_pipeline(state)
        return response
    except Exception as e:
        logger.error("Pipeline failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline execution failed: {str(e)}",
        )


# ═══════════════════════════════════════════════════════════════
# GET /api/history/{user_id}
# ═══════════════════════════════════════════════════════════════

@router.get("/history/{target_user_id}")
async def get_history(
    target_user_id: str,
    user_id: str = Depends(verify_user),
):
    """
    Fetch analysis history for a user.
    Users can only access their own history.
    """
    if target_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    base = settings.SUPABASE_URL
    url = (
        f"{base}/rest/v1/analysis_history"
        f"?user_id=eq.{user_id}&select=*&order=created_at.desc&limit=20"
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=_HEADERS)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=resp.status_code,
                detail="Failed to fetch history",
            )

        return {"status": "success", "history": resp.json()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("History fetch failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


# ═══════════════════════════════════════════════════════════════
# POST /api/upload-image
# ═══════════════════════════════════════════════════════════════

@router.post("/upload-image")
async def upload_image(
    image_url: str,
    image_type: str = "general",
    user_id: str = Depends(verify_user),
):
    """
    Store an image reference for use in ML model analysis.
    """
    base = settings.SUPABASE_URL
    row = {
        "user_id": user_id,
        "image_url": image_url,
        "image_type": image_type,
    }
    url = f"{base}/rest/v1/uploaded_images"

    try:
        headers = {**_HEADERS, "Prefer": "return=representation"}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=row, headers=headers)

        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=resp.status_code,
                detail="Failed to save image",
            )

        return {"status": "success", "image": resp.json()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Image upload failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
