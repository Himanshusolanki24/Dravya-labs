import torch
import json
from PIL import Image
from typing import List, Dict, Optional
from utils.logger import logger
from utils.helpers import get_model_path, get_config_path
from app.model_loader import load_trained_model
from training.transform import get_val_transforms


class SkinPredictor:
    """
    Loads the trained skin disease model and runs inference on images.
    Handles graceful degradation when no model is available.
    """

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.config: Dict = {}
        self.transform = get_val_transforms()
        self.is_ready = False
        self._load_resources()

    @property
    def status(self) -> Dict:
        """Returns current model status for health checks."""
        return {
            "model_loaded": self.is_ready,
            "device": str(self.device),
            "num_classes": len(self.config.get("classes", [])),
            "classes": self.config.get("classes", []),
        }

    def _load_resources(self):
        """Loads model and config from disk. Fails gracefully."""
        try:
            # Load config
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

            # Load model
            model_path = get_model_path()
            if not model_path.exists():
                logger.warning(f"Model weights not found at {model_path}. Run training first.")
                return

            num_classes = len(classes)
            self.model = load_trained_model(num_classes=num_classes, device=self.device)
            self.is_ready = True
            logger.info(f"Model loaded successfully ({num_classes} classes, device={self.device})")

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
                "skin_model.pth in the model/ directory."
            )

        # Preprocess
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)

        # Inference
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)

        # Get top-k
        classes = self.config.get("classes", [])
        actual_k = min(top_k, len(classes))
        top_probs, top_indices = torch.topk(probabilities, actual_k)

        descriptions = self.config.get("descriptions", {})

        results = []
        for i in range(actual_k):
            idx = top_indices[0][i].item()
            prob = top_probs[0][i].item()

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
