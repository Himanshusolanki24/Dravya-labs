import torch
import torch.nn as nn
from torchvision import models
from utils.logger import logger
from utils.helpers import get_model_path


def get_skin_model(num_classes: int, device: torch.device, pretrained: bool = True) -> nn.Module:
    """
    Loads EfficientNet-B0 and replaces the classifier head for skin disease classification.

    Args:
        num_classes: Number of output classes.
        device: torch device (cuda/cpu).
        pretrained: Whether to load ImageNet pretrained weights.
    """
    logger.info(f"Loading EfficientNet-B0 (pretrained={pretrained}, classes={num_classes})...")
    weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
    model = models.efficientnet_b0(weights=weights)

    # Replace classifier head
    # EfficientNet-B0 classifier: Sequential(Dropout, Linear(1280, 1000))
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)

    model = model.to(device)
    return model


def load_trained_model(num_classes: int, device: torch.device) -> nn.Module:
    """
    Loads a trained model from disk (model/skin_model.pth).

    Args:
        num_classes: Number of classes (must match the saved model).
        device: torch device (cuda/cpu).
    """
    model_path = get_model_path()
    if not model_path.exists():
        logger.error(f"Model file not found at {model_path}")
        raise FileNotFoundError(f"Model file not found at {model_path}")

    model = get_skin_model(num_classes=num_classes, device=device, pretrained=False)

    logger.info(f"Loading state dict from {model_path}...")
    state_dict = torch.load(model_path, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    return model
