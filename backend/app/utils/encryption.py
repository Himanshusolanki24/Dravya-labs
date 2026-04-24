import json
import logging

logger = logging.getLogger("dravya.encryption")


# =========================
# 🔐 Serialize Data (passthrough)
# =========================
def encrypt_json(data: str) -> str:
    """
    Returns data as-is (no encryption applied).
    """
    return data


# =========================
# 🔓 Deserialize Data (passthrough)
# =========================
def decrypt_json(token: str) -> str:
    """
    Returns token as-is (no decryption applied).
    """
    return token
