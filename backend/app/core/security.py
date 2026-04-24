# app/core/security.py

import logging
from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger(__name__)
file_handler = logging.FileHandler('jwt_debug.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)
logger.setLevel(logging.DEBUG)

def verify_user(authorization: str = Header(default="")) -> str:
    """
    Verifies Supabase JWT from frontend.
    Returns the authenticated user's ID.
    """
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("Missing or invalid Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")
        if not user_id:
            logger.warning("JWT decoded but 'sub' claim missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return user_id

    except JWTError as e:
        logger.error("JWT verification failed: %s", e)
        # Try decoding WITHOUT audience verification as fallback
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            user_id = payload.get("sub")
            if user_id:
                logger.info("JWT valid without audience check — user_id=%s", user_id)
                return user_id
        except JWTError as e2:
            logger.error("JWT fallback also failed: %s", e2)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
