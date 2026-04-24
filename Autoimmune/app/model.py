"""
Autoimmune Knowledge Model — PyTorch Architecture
Deep feedforward classifier:
  patient features → autoimmune disorder class

Architecture must match the training script (train_local.py) exactly.
"""

import torch
import torch.nn as nn


class AutoimmuneModel(nn.Module):
    """
    Deep feedforward network for autoimmune disorder classification.
    Architecture matches train_local.py: nn.Sequential named 'network'.

    Input:  Patient features (demographics + lab values + symptoms + antibodies)
    Output: logits over all disorder classes
    """

    def __init__(self, input_dim: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 1024),
            nn.ReLU(),
            nn.BatchNorm1d(1024),
            nn.Dropout(0.3),

            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),

            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),

            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.1),

            nn.Linear(128, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
