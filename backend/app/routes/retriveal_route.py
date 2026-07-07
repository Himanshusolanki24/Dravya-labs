from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import verify_user
from app.utils.encryption import decrypt_json
from app.services.supabase import fetch_row_by_id
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/profile/{profile_id}")
def get_health_profile(profile_id: str, user_id: str = Depends(verify_user)):
    """
    Fetches health profile from Supabase.
    Only accessible by the profile owner.
    """
    try:
        record = fetch_row_by_id("health_profiles", "id", profile_id)

        if not record:
            raise HTTPException(status_code=404, detail="Profile not found")

        if record["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to this profile"
            )

        decrypted_data = decrypt_json(record["encrypted_payload"])

        return {
            "profile_id": profile_id,
            "health_data": decrypted_data  # used internally by AI
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")
