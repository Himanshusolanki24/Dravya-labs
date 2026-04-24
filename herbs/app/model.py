"""
Herb Knowledge Model — PyTorch Architecture
Feedforward classifier for Ayurvedic herb identification.
Input: TF-IDF text features (Rasa, Guna, Virya, etc.) + dosha one-hot features
Output: logits over all Ayurvedic herb classes (~700)
"""

import torch
import torch.nn as nn


class HerbKnowledgeModel(nn.Module):
    """
    Feedforward neural network for Ayurvedic herb classification.

    Input:  TF-IDF text features (3000-dim) + dosha one-hot features (7-dim)
    Output: logits over all herb classes (~700)

    Architecture:
        Linear(input → 512) → ReLU → BatchNorm → Dropout(0.3)
        Linear(512 → 256)   → ReLU → BatchNorm → Dropout(0.2)
        Linear(256 → classes)
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

            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
