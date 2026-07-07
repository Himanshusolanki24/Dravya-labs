import os
import json
import logging
import numpy as np
import lightgbm as lgb
from typing import Dict, List

logger = logging.getLogger(__name__)

class BrahmaPredictor:
    """Singleton predictor that loads the Brahma LightGBM model and metadata once."""

    def __init__(self):
        self.model = None
        self.metadata = None
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self, model_dir: str) -> None:
        """Load metadata and LightGBM model from model_dir."""
        logger.info(f"📂 Loading Brahma model from: {model_dir}")

        meta_path = os.path.join(model_dir, "model_metadata.json")
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Missing {meta_path}")

        with open(meta_path, 'r') as f:
            self.meta = json.load(f)

        self.input_dim = self.meta['input_dim']
        self.num_classes = self.meta['num_classes']
        self.features = self.meta['features']
        self.feature_classes = self.meta['feature_classes']
        self.id_to_name = {int(k): v for k, v in self.meta['id_to_name'].items()}

        model_path = os.path.join(model_dir, "brahma_model.txt")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Missing {model_path}")

        self.model = lgb.Booster(model_file=model_path)
        self._loaded = True
        logger.info("🕉️ Brahma LightGBM predictor ready!")

    def predict(self, input_features: Dict[str, str]) -> List[Dict]:
        """Runs the 29 features through the knowledge model to retrieve Dosha classification."""
        if not self._loaded:
            raise RuntimeError("Brahma model is not loaded.")

        # Encode categorical features matching the training protocol exactly
        features = np.zeros((1, self.input_dim), dtype=np.float32)

        for i, feature_name in enumerate(self.features):
            provided_val = str(input_features.get(feature_name, "")).strip().lower()
            allowed_classes = self.feature_classes.get(feature_name, [])

            if provided_val in allowed_classes:
                encoded_idx = allowed_classes.index(provided_val)
            else:
                encoded_idx = 0

            features[0, i] = encoded_idx

        # Predict returns probabilities for each class since it's multiclass
        probs = self.model.predict(features)[0]
        
        # Sort indices by descending probability
        top_idx = np.argsort(probs)[::-1][:self.num_classes]

        results = []
        for rank, idx in enumerate(top_idx, start=1):
            prob = probs[idx]
            dosha = self.id_to_name.get(idx, "Unknown")
            results.append({
                "rank": rank,
                "dosha": dosha.title(),
                "confidence": round(float(prob), 6)
            })

        return results
