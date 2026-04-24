from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_user
from app.services.mistral_service import ask_mistral
from app.routes.retrieval_routes import get_health_profile
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze/{profile_id}")
def analyze_health_profile(profile_id: str, user_id: str = Depends(verify_user)):
    """
    Retrieves decrypted health profile and runs AI analysis.
    """
    try:
        # 🔓 Get decrypted health data
        profile = get_health_profile(profile_id, user_id)
        health_data = json.loads(profile["health_data"])

        summary_text = f"""
        Chief complaint: {health_data.get('chief_complaint')}
        Appetite: {health_data.get('appetite')}
        Sleep: {health_data.get('sleep_pattern')}
        Stress response: {health_data.get('stress_response')}
        Energy levels: {health_data.get('energy_pattern')}
        Digestion: {health_data.get('elimination')}
        Exercise: {health_data.get('exercise')}
        """

        messages = [
            {
                "role": "system",
                "content": "You are an Ayurvedic health analysis assistant. Provide a safe, educational wellness assessment. Do not diagnose diseases."
            },
            {
                "role": "user",
                "content": summary_text
            }
        ]

        ai_response = ask_mistral(messages)

        return {
            "profile_id": profile_id,
            "analysis": ai_response
        }

    except Exception as e:
        logger.error(f"AI analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI analysis failed")
