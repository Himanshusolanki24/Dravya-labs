import logging
from nacl import secret
from app.core.config import settings

logger = logging.getLogger("dravya.encryption")

_box = secret.SecretBox(bytes.fromhex(settings.ENCRYPTION_KEY))

# =========================
# 🔐 Serialize Data
# =========================
def encrypt_json(data: str) -> str:
    """
    Encrypts the JSON string using PyNaCl SecretBox.
    """
    try:
        encrypted = _box.encrypt(data.encode())
        return encrypted.hex()
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        raise


# =========================
# 🔓 Deserialize Data
# =========================
def decrypt_json(token: str) -> str:
    """
    Decrypts the token string back to JSON.
    """
    try:
        decrypted = _box.decrypt(bytes.fromhex(token))
        return decrypted.decode()
    except Exception as e:
        logger.error(f"Decryption failed: {e}")
        raise
