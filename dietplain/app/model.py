"""
Dietplain Knowledge Model — PyTorch Architecture
Deep feedforward network for nutritional food classification:
  macronutrients + meal type → specific food item
"""

import torch
import torch.nn as nn

class DietplainModel(nn.Module):
    """
    Wide deep network for precise food item classification.
    Input: Nutritional values (Calories, Protein, etc.) + Encoded Meal Type
    Output: logits over all food items
    """
    def __init__(self, input_dim: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 1024),
            nn.ReLU(),
            nn.BatchNorm1d(1024),
            nn.Dropout(0.2),

            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),

            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.1),

            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.1),

            nn.Linear(128, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
