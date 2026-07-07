"""
Skin Disease Inference — TensorFlow/Keras
Replaces PyTorch-based inference pipeline.
"""

import json
import numpy as np
import tensorflow as tf
from PIL import Image
from typing import List, Dict
from utils.logger import logger
from utils.helpers import get_model_path, get_config_path
from app.model_loader import load_trained_model


class SkinPredictor:
    """
    Loads the trained skin disease model and runs inference on images.
    Handles graceful degradation when no model is available.
    """

    def __init__(self):
        self.model = None
        self.config: Dict = {}
        self.is_ready = False
        self._load_resources()

    @property
    def status(self) -> Dict:
        """Returns current model status for health checks."""
        return {
            "model_loaded": self.is_ready,
            "backend": "tensorflow",
            "num_classes": len(self.config.get("classes", [])),
            "classes": self.config.get("classes", []),
        }

    def _load_resources(self):
        """Loads model and config from disk. Fails gracefully."""
        try:
            config_path = get_config_path()
            if not config_path.exists():
                logger.warning(f"Config not found at {config_path}. Model not trained yet.")
                return

            with open(config_path, "r") as f:
                self.config = json.load(f)

            classes = self.config.get("classes", [])
            if not classes:
                logger.warning("Config has no classes. Run training first.")
                return

            model_path = get_model_path()
            if not model_path.exists():
                logger.warning(f"Model weights not found at {model_path}. Run training first.")
                return

            num_classes = len(classes)
            self.model = load_trained_model(num_classes=num_classes)
            self.is_ready = True
            logger.info(f"TF Model loaded successfully ({num_classes} classes)")

        except Exception as e:
            logger.error(f"Error loading resources: {e}")
            self.model = None
            self.is_ready = False

    def predict(self, image: Image.Image, top_k: int = 3) -> List[Dict]:
        """
        Runs prediction on a single PIL image.
        Returns top-k predictions with disease name, confidence, and description.
        """
        if not self.is_ready or self.model is None:
            raise RuntimeError(
                "Model not loaded. Please train the model first and place "
                "skin_model.h5 in the model/ directory."
            )

        # Preprocess — resize, normalize to [0,1], add batch dim
        img = image.convert("RGB").resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Inference
        predictions = self.model.predict(img_array, verbose=0)
        probabilities = predictions[0]

        # Get top-k
        classes = self.config.get("classes", [])
        actual_k = min(top_k, len(classes))
        top_indices = np.argsort(probabilities)[::-1][:actual_k]

        descriptions = self.config.get("descriptions", {})

        results = []
        for idx in top_indices:
            prob = float(probabilities[idx])
            label = classes[idx] if idx < len(classes) else "Unknown"
            desc = descriptions.get(label, "No description available.")

            results.append({
                "disease": label,
                "confidence": round(prob, 4),
                "description": desc,
            })

        return results


# Singleton instance — created at import time
predictor = SkinPredictor()
