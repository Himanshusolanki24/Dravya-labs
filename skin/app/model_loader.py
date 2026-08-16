"""
Skin Disease Model Loader — TensorFlow/Keras (EfficientNetB0)
Replaces PyTorch torchvision model loader.
"""

import logging
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, Model
from utils.logger import logger
from utils.helpers import get_model_path


def get_skin_model(num_classes: int, pretrained: bool = True) -> Model:
    """
    Loads EfficientNet-B0 and replaces the classifier head for skin disease classification.

    Args:
        num_classes: Number of output classes.
        pretrained: Whether to load ImageNet pretrained weights.
    """
    logger.info(f"Loading EfficientNet-B0 (pretrained={pretrained}, classes={num_classes})...")

    weights = "imagenet" if pretrained else None
    base_model = EfficientNetB0(weights=weights, include_top=False, pooling="avg")

    # Build classifier head
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = Model(inputs, outputs)
    return model


def load_trained_model(num_classes: int) -> Model:
    """
    Loads a trained Keras model from disk.

    Args:
        num_classes: Number of classes (must match the saved model).
    """
    model_path = get_model_path()

    if not model_path.exists():
        logger.error(f"Model file not found at {model_path}")
        raise FileNotFoundError(f"Model file not found at {model_path}")
    logger.info(f"Loading Keras model from {model_path}...")
    return tf.keras.models.load_model(model_path, compile=False)
