# app/routes/onboarding_route.py

import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from app.core.security import verify_user
from app.utils.encryption import encrypt_json, decrypt_json
from app.services.supabase import insert_row, fetch_row_by_id
from app.services.embeddings import generate_embedding
from app.services.pinecone import index as pinecone_index

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])


# ─── Pydantic Models ─────────────────────────────────────────

class BasicProfile(BaseModel):
    full_name: str
    age: int
    gender: str
    height: Optional[float] = None
    weight: Optional[float] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    activity_level: str = "moderate"  # sedentary | moderate | active


class HealthMetrics(BaseModel):
    blood_pressure: Optional[str] = None
    blood_sugar_fasting: Optional[str] = None
    blood_sugar_post_meal: Optional[str] = None
    cholesterol: Optional[str] = None
    thyroid_levels: Optional[str] = None
    heart_rate: Optional[str] = None
    sleep_duration: Optional[str] = None
    stress_level: Optional[int] = Field(None, ge=1, le=10)


class DietInfo(BaseModel):
    diet_type: Optional[str] = None  # vegetarian | non-veg | vegan
    food_allergies: Optional[str] = None
    daily_water_intake: Optional[str] = None
    current_diet_pattern: Optional[str] = None
    cheat_meal_frequency: Optional[str] = None
    supplements: Optional[str] = None


class MedicalHistory(BaseModel):
    conditions: list[str] = []  # diabetes, pcos, thyroid, hypertension, etc.
    injury_history: Optional[str] = None
    surgery_history: Optional[str] = None
    consent: bool = False


class OnboardingPayload(BaseModel):
    basic_profile: BasicProfile
    health_metrics: HealthMetrics
    diet_info: DietInfo
    medical_history: MedicalHistory


# ─── Distillation (anonymization) ────────────────────────────

def _get_age_group(age: int) -> str:
    if age < 18:
        return "under-18"
    elif age <= 25:
        return "18-25"
    elif age <= 35:
        return "26-35"
    elif age <= 45:
        return "36-45"
    elif age <= 55:
        return "46-55"
    elif age <= 65:
        return "56-65"
    else:
        return "65+"


def distill_profile(payload: OnboardingPayload) -> dict:
    """
    Create an ANONYMIZED summary from the health payload.
    Never include PII (name, exact age, location, etc.).
    """
    conditions = [c.lower() for c in payload.medical_history.conditions]

    return {
        "age_group": _get_age_group(payload.basic_profile.age),
        "gender": payload.basic_profile.gender.lower(),
        "conditions": conditions,
        "activity_level": payload.basic_profile.activity_level.lower(),
        "diet_type": (payload.diet_info.diet_type or "not_specified").lower(),
        "stress_level": payload.health_metrics.stress_level,
        "sleep_duration": payload.health_metrics.sleep_duration,
        "supplements": payload.diet_info.supplements,
    }


def distill_to_text(metadata: dict) -> str:
    """Convert anonymized metadata into a sentence for embedding."""
    parts = [
        f"Age group: {metadata['age_group']}",
        f"Gender: {metadata['gender']}",
        f"Activity level: {metadata['activity_level']}",
        f"Diet type: {metadata['diet_type']}",
    ]
    if metadata.get("conditions"):
        parts.append(f"Conditions: {', '.join(metadata['conditions'])}")
    if metadata.get("stress_level"):
        parts.append(f"Stress level: {metadata['stress_level']}/10")
    if metadata.get("sleep_duration"):
        parts.append(f"Sleep: {metadata['sleep_duration']}")
    if metadata.get("supplements"):
        parts.append(f"Supplements: {metadata['supplements']}")
    return ". ".join(parts)


# ─── Route ────────────────────────────────────────────────────

@router.post("/save-profile")
async def save_profile(
    payload: OnboardingPayload,
    user_id: str = Depends(verify_user),
):
    """
    Save health profile to Supabase and
    anonymized vector to Pinecone.
    """

    # 1. Validate consent
    if not payload.medical_history.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must consent to data storage.",
        )

    # 2. Serialize the full payload
    raw_json = json.dumps(payload.model_dump(), default=str)
    encrypted = encrypt_json(raw_json)

    # 3. Upsert into Supabase (update if profile already exists)
    try:
        existing = fetch_row_by_id("user_health_profiles", "user_id", user_id)
        if existing:
            # Update existing row via REST API
            import requests as req
            from app.core.config import settings

            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            }
            url = f"{settings.SUPABASE_URL}/rest/v1/user_health_profiles?user_id=eq.{user_id}"
            resp = req.patch(url, json={"encrypted_health_json": encrypted}, headers=headers)
            resp.raise_for_status()
        else:
            insert_row("user_health_profiles", {
                "user_id": user_id,
                "encrypted_health_json": encrypted,
            })
    except Exception as e:
        logger.error("Supabase insert/update failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store health profile.",
        )

    # 4. Distill anonymized data
    anonymized = distill_profile(payload)

    # 5. Generate embedding from distilled text
    try:
        summary_text = distill_to_text(anonymized)
        embedding = generate_embedding(summary_text)
    except Exception as e:
        logger.warning("Embedding generation failed (non-fatal): %s", e)
        embedding = None

    # 6. Upsert to Pinecone (best-effort, don't fail the request)
    if embedding:
        try:
            pinecone_index.upsert(
                vectors=[
                    {
                        "id": user_id,
                        "values": embedding,
                        "metadata": anonymized,
                    }
                ]
            )
        except Exception as e:
            logger.warning("Pinecone upsert failed (non-fatal): %s", e)

    return {
        "status": "success",
        "message": "Profile saved securely.",
    }


@router.get("/get-profile")
async def get_profile(user_id: str = Depends(verify_user)):
    """
    Fetch the current user's health profile.
    Returns 404 if no profile has been saved yet.
    """
    try:
        record = fetch_row_by_id("user_health_profiles", "user_id", user_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No health profile found. Please complete onboarding.",
            )

        decrypted = decrypt_json(record["encrypted_health_json"])
        import json as _json
        profile_data = _json.loads(decrypted)

        return {
            "status": "success",
            "profile": profile_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Profile retrieval failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health profile.",
        )

