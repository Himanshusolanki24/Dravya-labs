"""TensorFlow/Keras runtime for the diabetes risk classifier."""

import json
import logging
import os

import numpy as np
import tensorflow as tf

logger = logging.getLogger(__name__)

_model: tf.keras.Model | None = None
_scaler_params: dict | None = None


def load_model(model_path: str | None = None, scaler_path: str | None = None):
    """Load the portable Keras model and its standardization parameters."""
    global _model, _scaler_params
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = model_path or os.path.join(base, "diabetes_model.keras")
    scaler_path = scaler_path or os.path.join(base, "scaler_params.json")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    _model = tf.keras.models.load_model(model_path, compile=False)
    with open(scaler_path, "r", encoding="utf-8") as file:
        _scaler_params = json.load(file)
    logger.info("Diabetes TensorFlow/Keras model loaded.")
    return _model, _scaler_params


def predict(features: list[float]) -> dict:
    if _model is None or _scaler_params is None:
        raise RuntimeError("Model not loaded.")
    mean = np.asarray(_scaler_params["mean"], dtype=np.float32)
    scale = np.asarray(_scaler_params["scale"], dtype=np.float32)
    scale[scale == 0] = 1.0
    values = (np.asarray(features, dtype=np.float32) - mean) / scale
    probability = float(_model.predict(values.reshape(1, -1), verbose=0)[0][0])
    return {
        "prediction": "Diabetic" if probability >= 0.5 else "Non-Diabetic",
        "probability": round(probability, 4),
        "is_diabetic": probability >= 0.5,
    }
