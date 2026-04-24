import os
import json
import logging
import torch
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from .model import DietplainModel

logger = logging.getLogger(__name__)

class DietPredictor:
    """Singleton predictor that loads the Dietplain model and metadata once."""

    def __init__(self):
        self.model = None
        self.metadata = None
        self.device = torch.device('cpu')  # Run API on CPU
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self, model_dir: str) -> None:
        """Load metadata, PyTorch weights, and CSV lookups from model_dir."""
        logger.info(f"📂 Loading Dietplain model from: {model_dir}")

        # 1. Load Metadata First
        meta_path = os.path.join(model_dir, "model_metadata.json")
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Missing {meta_path}")

        with open(meta_path, 'r') as f:
            self.meta = json.load(f)

        self.input_dim = self.meta['input_dim']
        self.num_classes = self.meta['num_classes']
        self.feature_columns = self.meta['feature_columns']
        self.continuous_cols = self.meta['continuous_columns']
        
        # Mappings
        self.id_to_name = {int(k): v for k, v in self.meta['id_to_name'].items()}
        self.meal_classes = self.meta['meal_classes']

        # Normalization constraints
        self.min_vals = np.array(self.meta['scaler_params']['min'])
        self.max_vals = np.array(self.meta['scaler_params']['max'])
        
        # Range protection calculation
        self.scale = self.max_vals - self.min_vals
        self.scale[self.scale == 0] = 1.0  # Prevent division by zero

        # 2. Load PyTorch model
        model_path = os.path.join(model_dir, "dietplain_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Missing {model_path}")

        self.model = DietplainModel(self.input_dim, self.num_classes)
        state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        # 3. Load Food Lookup CSV
        lookup_path = os.path.join(model_dir, "food_lookup.csv")
        if os.path.exists(lookup_path):
            self.food_db = pd.read_csv(lookup_path)
            self.food_db.set_index('Food_Item', inplace=True)
        else:
            logger.warning(f"⚠️ Missing {lookup_path}, nutritional lookups will be empty")
            self.food_db = None

        self._loaded = True
        logger.info("🥗 Dietplain predictor ready!")

    def _lookup(self, food_name: str) -> Dict:
        """Fetch average nutritional footprint for a given food item."""
        if self.food_db is None or food_name not in self.food_db.index:
            return {}
        
        row = self.food_db.loc[food_name]
        return row.to_dict()

    def predict(
        self,
        meal_type: str,
        calories: float,
        protein: float,
        carbs: float,
        fat: float,
        fiber: float,
        sugars: float,
        sodium: float,
        cholesterol: float,
        water_intake: float,
        top_k: int = 5,
    ) -> List[Dict]:
        """Runs the dietary parameters through the knowledge model to retrieve top food items."""
        if not self._loaded:
            raise RuntimeError("Dietplain model is not loaded.")

        # Reconstruct exactly matching feature arrangement
        features = np.zeros(self.input_dim, dtype=np.float32)

        # Encode categorical Meal Type (Fallback to index 0 if not found)
        meal_idx = self.meal_classes.index(meal_type) if meal_type in self.meal_classes else 0

        # Construct raw continuous features array in EXACT order of training
        raw_continuous = np.array([
            calories, protein, carbs, fat,
            fiber, sugars, sodium, cholesterol,
            water_intake
        ], dtype=np.float32)

        # Min-Max Normalization (matches Scikit-Learn logic)
        norm_continuous = (raw_continuous - self.min_vals) / self.scale
        
        # Clip to safely handle out-of-distribution values
        norm_continuous = np.clip(norm_continuous, 0.0, 1.0)

        # Build final tensor layout matching training features configuration:
        # [Meal_Type_Encoded, Continuous_0, Continuous_1... Continuous_N]
        features[0] = meal_idx
        features[1: 1 + len(norm_continuous)] = norm_continuous
        
        tensor = torch.FloatTensor(features).unsqueeze(0).to(self.device)

        # Run inference Model Check
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            top_probs, top_idx = torch.topk(probs, min(top_k, self.num_classes), dim=1)

        # Organize result output
        results = []
        for rank, (prob, idx) in enumerate(zip(top_probs[0].tolist(), top_idx[0].tolist()), start=1):
            food_item = self.id_to_name.get(idx, "Unknown Food")
            
            info = self._lookup(food_item)
            
            results.append({
                "rank": rank,
                "food_name": food_item,
                "confidence": round(prob, 6),
                "nutritional_profile": {
                    "calories_kcal": round(info.get('Calories (kcal)', 0), 1),
                    "protein_g": round(info.get('Protein (g)', 0), 1),
                    "carbs_g": round(info.get('Carbohydrates (g)', 0), 1),
                    "fat_g": round(info.get('Fat (g)', 0), 1),
                    "fiber_g": round(info.get('Fiber (g)', 0), 1)
                }
            })

        return results
