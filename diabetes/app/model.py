"""
Diabetes prediction model — LightGBM
Binary classifier for diabetes risk: 8 numeric features → probability
"""

import json
import os
import logging
import numpy as np
import lightgbm as lgb

logger = logging.getLogger(__name__)


_model = None
_scaler_params = None


def load_model(model_path: str = None, scaler_path: str = None):
    """Load LightGBM model and scaler params."""
    global _model, _scaler_params

    if model_path is None:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base, "diabetes_model.txt")
        scaler_path = os.path.join(base, "scaler_params.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    _model = lgb.Booster(model_file=model_path)

    if scaler_path and os.path.exists(scaler_path):
        with open(scaler_path, "r") as f:
            _scaler_params = json.load(f)

    logger.info("✅ Diabetes LightGBM model loaded.")
    return _model, _scaler_params


def predict(features: list[float]) -> dict:
    """Run prediction on scaled features. Returns probability and label."""
    global _model, _scaler_params

    if _model is None:
        raise RuntimeError("Model not loaded.")

    # Scale features
    if _scaler_params:
        mean = _scaler_params["mean"]
        scale = _scaler_params["scale"]
        features = [(features[i] - mean[i]) / scale[i] for i in range(len(features))]

    arr = np.array([features], dtype=np.float64)
    probability = float(_model.predict(arr)[0])

    is_diabetic = probability >= 0.5
    prediction = "Diabetic" if is_diabetic else "Non-Diabetic"

    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "is_diabetic": is_diabetic,
    }
