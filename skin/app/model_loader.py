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
    Loads a trained model from disk (model/skin_model.h5 or SavedModel).

    Args:
        num_classes: Number of classes (must match the saved model).
    """
    model_path = get_model_path()

    # Support both .h5 and SavedModel directory formats
    h5_path = str(model_path).replace(".pth", ".h5")
    saved_model_path = str(model_path).replace(".pth", "")

    import os
    if os.path.exists(h5_path):
        logger.info(f"Loading TF model from {h5_path}...")
        model = tf.keras.models.load_model(h5_path)
    elif os.path.isdir(saved_model_path):
        logger.info(f"Loading SavedModel from {saved_model_path}...")
        model = tf.keras.models.load_model(saved_model_path)
    elif os.path.exists(str(model_path)):
        # Fallback: try to build from scratch and load weights
        logger.info(f"Loading weights from {model_path}...")
        model = get_skin_model(num_classes=num_classes, pretrained=False)
        model.load_weights(str(model_path))
    else:
        logger.error(f"Model file not found at {model_path}")
        raise FileNotFoundError(f"Model file not found at {model_path}")

    return model
