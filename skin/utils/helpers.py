import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
from dotenv import load_dotenv
from pathlib import Path
from utils.logger import logger

# Project root = the 'skin' directory (parent of utils/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load environment variables from .env.local
env_path = PROJECT_ROOT / ".env.local"
load_dotenv(dotenv_path=env_path)

def get_hf_token() -> str:
    """
    Retrieves the Hugging Face token from environment variables.
    Raises ValueError if not found.
    """
    token = os.getenv("HF_TOKEN")
    if not token:
        logger.error("HF_TOKEN not found in .env.local or environment variables.")
        raise ValueError("HF_TOKEN not found. Please set it in .env.local")
    return token.strip()

def get_model_path() -> Path:
    """
    Returns the path to the model weights file.
    """
    path = PROJECT_ROOT / "model" / "skin_model.pth"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path

def get_config_path() -> Path:
    """
    Returns the path to the model configuration file.
    """
    path = PROJECT_ROOT / "model" / "model_config.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path
