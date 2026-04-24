"""
Symptom→Treatment Model — PyTorch Architecture
Deep feedforward classifier:
  patient symptoms/features → Ayurvedic disease class

Architecture must match the training script (training/train_model.py) exactly.
"""

import torch
import torch.nn as nn


class SymptomTreatmentModel(nn.Module):
    """
    Deep feedforward network for Ayurvedic disease classification
    from patient symptoms and constitutional parameters.

    Input:  Patient features (demographics + symptoms + dosha indicators)
    Output: logits over all disease classes (447 diseases)
    """

    def __init__(self, input_dim: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),

            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),

            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),

            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(0.1),

            nn.Linear(64, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
