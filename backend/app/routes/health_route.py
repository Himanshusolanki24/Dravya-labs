from fastapi import APIRouter, Depends, HTTPException, status
from app.models.health import HealthProfileInput
from app.core.security import verify_user
from app.utils.encryption import encrypt_json
from app.services.supabase import insert_row
from app.services.embeddings import embed_text
from app.services.helix_db import index
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# ===============================
# 🧍 Submit Health Profile
# ===============================
@router.post(
    "/submit",
    status_code=status.HTTP_201_CREATED,
    summary="Submit health profile",
    description="Receives user health form, stores securely, and creates vector embedding for AI retrieval."
)
def submit_health_profile(
    data: HealthProfileInput,
    user_id: str = Depends(verify_user)
):
    try:
        profile_id = str(uuid.uuid4())
        logger.info(f"Receiving health profile from user {user_id}")

        # 🔐 Serialize full medical form JSON
        encrypted_payload = encrypt_json(data.json())

        # 🗄 Store payload in Supabase
        insert_row("health_profiles", {
            "id": profile_id,
            "user_id": user_id,
            "encrypted_payload": encrypted_payload
        })

        logger.info(f"Profile stored in Supabase for user {user_id}")

        # 🧠 Build SAFE RAG Summary (no sensitive history)
        rag_summary = build_rag_summary(data)

        # 🧬 Generate embedding
        embedding = embed_text(rag_summary)

        # 📚 Store embedding in Pinecone
        index.upsert([{
            "id": profile_id,
            "values": embedding,
            "metadata": {
                "user_id": user_id,
                "record_type": "health_profile"
            }
        }])

        logger.info(f"Embedding stored in Pinecone for profile {profile_id}")

        return {
            "status": "stored_securely",
            "profile_id": profile_id
        }

    except Exception as e:
        logger.error(f"Health profile submission failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store health profile securely"
        )


# ===============================
# 🧠 Helper: Build RAG Summary
# ===============================
def build_rag_summary(data: HealthProfileInput) -> str:
    """
    Creates a non-sensitive summary used for vector search.
    Avoids personal identifiers and detailed medical history.
    """

    bmi_category = categorize_bmi(data.bmi)

    summary = f"""
    Chief complaint: {data.chief_complaint}
    Appetite pattern: {data.appetite}
    Sleep pattern: {data.sleep_pattern}
    Stress response: {data.stress_response}
    Energy levels: {data.energy_pattern}
    Digestion: {data.elimination}
    Exercise frequency: {data.exercise}
    BMI category: {bmi_category}
    """

    return summary.strip()


# ===============================
# 📊 Helper: BMI Categorization
# ===============================
def categorize_bmi(bmi: float | None) -> str:
    if bmi is None:
        return "unknown"

    if bmi < 18.5:
        return "underweight"
    elif 18.5 <= bmi < 25:
        return "normal"
    elif 25 <= bmi < 30:
        return "overweight"
    else:
        return "obese"
