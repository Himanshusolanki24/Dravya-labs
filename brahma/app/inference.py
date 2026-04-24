import os
import json
import logging
import torch
import numpy as np
import pandas as pd
from typing import Dict, List
from .model import BrahmaModel

logger = logging.getLogger(__name__)

class BrahmaPredictor:
    """Singleton predictor that loads the Brahma model and metadata once."""

    def __init__(self):
        self.model = None
        self.metadata = None
        self.device = torch.device('cpu')
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self, model_dir: str) -> None:
        """Load metadata, PyTorch weights, and label encoders from model_dir."""
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

        model_path = os.path.join(model_dir, "brahma_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Missing {model_path}")

        self.model = BrahmaModel(self.input_dim, self.num_classes)
        state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self._loaded = True
        logger.info("🕉️ Brahma predictor ready!")

    def predict(self, input_features: Dict[str, str]) -> List[Dict]:
        """Runs the 29 features through the knowledge model to retrieve Dosha classification."""
        if not self._loaded:
            raise RuntimeError("Brahma model is not loaded.")

        # Encode categorical features matching the training protocol exactly
        features = np.zeros(self.input_dim, dtype=np.float32)

        for i, feature_name in enumerate(self.features):
            provided_val = str(input_features.get(feature_name, "")).strip().lower()
            allowed_classes = self.feature_classes.get(feature_name, [])

            if provided_val in allowed_classes:
                encoded_idx = allowed_classes.index(provided_val)
            else:
                # Fallback to index 0 if not cleanly recognized
                encoded_idx = 0

            features[i] = encoded_idx

        tensor = torch.FloatTensor(features).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            
            # Retrieve all doshas ranked by probability
            top_probs, top_idx = torch.topk(probs, self.num_classes, dim=1)

        results = []
        for rank, (prob, idx) in enumerate(zip(top_probs[0].tolist(), top_idx[0].tolist()), start=1):
            dosha = self.id_to_name.get(idx, "Unknown")
            results.append({
                "rank": rank,
                "dosha": dosha.title(),
                "confidence": round(prob, 6)
            })

        return results
