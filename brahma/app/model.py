"""
Brahma Prakriti Knowledge Model — PyTorch Architecture
Deep feedforward network for Dosha classification:
  29 Categorical encoded physical/lifestyle traits → Dosha (Vata, Pitta, Kapha, etc)
"""

import torch
import torch.nn as nn

class BrahmaModel(nn.Module):
    """
    Categorical classification network.
    Input (29 encoded integers) -> 512 -> 256 -> 128 -> 6 Dosha Classes
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
            nn.Dropout(0.2),

            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.1),

            nn.Linear(128, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
