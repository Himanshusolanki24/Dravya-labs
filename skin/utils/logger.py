import logging
import sys
from pathlib import Path

def setup_logger(name: str = "dravya_skin_ai", log_file: str = "app.log", level=logging.INFO):
    """
    Sets up a logger with both console and file handlers.
    """
    # Create logs directory if it doesn't exist
    log_path = Path("logs")
    log_path.mkdir(exist_ok=True)
    
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    handler = logging.FileHandler(log_path / log_file)        
    handler.setFormatter(formatter)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times
    if not logger.handlers:
        logger.addHandler(handler)
        logger.addHandler(console_handler)

    return logger

logger = setup_logger()
