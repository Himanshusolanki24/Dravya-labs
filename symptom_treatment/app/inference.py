"""
Symptom→Treatment Model — Inference Engine
Loads the trained .pth model + metadata, rebuilds feature processing,
and provides prediction functions for the FastAPI service.
"""

import json
import os
import logging
import numpy as np
import pandas as pd
import torch
from typing import List, Dict, Optional

from app.model import SymptomTreatmentModel

logger = logging.getLogger(__name__)


class SymptomTreatmentPredictor:
    """
    Loads model artifacts and serves predictions.
    Initialized once at FastAPI startup.
    """

    def __init__(self):
        self.model: Optional[SymptomTreatmentModel] = None
        self.id_to_name: Dict[int, str] = {}
        self.name_to_id: Dict[str, int] = {}
        self.treatment_lookup: Optional[pd.DataFrame] = None
        self.num_classes: int = 0
        self.input_dim: int = 0
        self.feature_columns: List[str] = []
        self.continuous_columns: List[str] = []
        self.binary_columns: List[str] = []
        self.categorical_columns: List[str] = []
        self.scaler_min: Optional[np.ndarray] = None
        self.scaler_max: Optional[np.ndarray] = None
        self.gender_map: Dict[str, int] = {}
        self.symptom_columns: List[str] = []
        self._loaded: bool = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def total_diseases(self) -> int:
        return self.num_classes

    @property
    def total_features(self) -> int:
        return self.input_dim

    def load(self, model_dir: str) -> None:
        """
        Load all artifacts:
          - symptom_treatment_model.pth   (PyTorch state dict)
          - model_metadata.json           (label mappings, scaler params, feature config)
          - treatment_lookup.csv          (disease → treatment info for responses)
        """
        logger.info(f"📂 Loading model from: {model_dir}")

        # 1. Metadata
        meta_path = os.path.join(model_dir, "model_metadata.json")
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Metadata not found: {meta_path}")

        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        self.num_classes = metadata["num_classes"]
        self.input_dim = metadata["input_dim"]
        self.id_to_name = {int(k): v for k, v in metadata["id_to_name"].items()}
        self.name_to_id = metadata["name_to_id"]
        self.feature_columns = metadata["feature_columns"]
        self.continuous_columns = metadata.get("continuous_columns", [])
        self.binary_columns = metadata.get("binary_columns", [])
        self.categorical_columns = metadata.get("categorical_columns", [])
        self.gender_map = metadata.get("gender_map", {"Male": 0, "Female": 1})
        self.symptom_columns = metadata.get("symptom_columns", [])

        # Scaler params for normalizing continuous features
        scaler = metadata.get("scaler_params", {})
        if scaler:
            self.scaler_min = np.array(scaler["min"], dtype=np.float32)
            self.scaler_max = np.array(scaler["max"], dtype=np.float32)

        # 2. Load PyTorch model
        model_path = os.path.join(model_dir, "symptom_treatment_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weights not found: {model_path}")

        self.model = SymptomTreatmentModel(self.input_dim, self.num_classes)
        state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        logger.info(f"✅ Model loaded: {self.input_dim} features → {self.num_classes} disease classes")

        # 3. Treatment lookup table
        lookup_path = os.path.join(model_dir, "treatment_lookup.csv")
        if os.path.exists(lookup_path):
            self.treatment_lookup = pd.read_csv(lookup_path, encoding="utf-8").fillna("")
            logger.info(f"✅ Treatment lookup: {len(self.treatment_lookup)} diseases")
        else:
            logger.warning("⚠️ treatment_lookup.csv not found — predictions will lack treatment details")
            self.treatment_lookup = pd.DataFrame()

        self._loaded = True
        logger.info("🔬 Symptom→Treatment predictor ready!")

    def predict(
        self,
        age: int = 30,
        gender: str = "Male",
        prakriti: Optional[str] = None,
        vata_score: float = 0.0,
        pitta_score: float = 0.0,
        kapha_score: float = 0.0,
        symptoms: Optional[Dict[str, int]] = None,
        chief_complaint: Optional[str] = None,
        severity: Optional[str] = None,
        diet_type: Optional[str] = None,
        sleep_pattern: Optional[str] = None,
        stress_level: int = 5,
        activity_level: Optional[str] = None,
        blood_sugar: float = 0.0,
        bmi: float = 0.0,
        top_k: int = 5,
    ) -> List[Dict]:
        """
        Given patient symptom data, return top-K Ayurvedic disease predictions
        with treatment recommendations.
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded — call load() first")

        # Build the feature vector in the same order as training
        feature_dict: Dict[str, float] = {}

        # Demographics
        feature_dict["Age"] = float(age)
        feature_dict["Gender"] = float(self.gender_map.get(gender, 0))

        # Dosha scores
        feature_dict["Vata_Score"] = float(vata_score)
        feature_dict["Pitta_Score"] = float(pitta_score)
        feature_dict["Kapha_Score"] = float(kapha_score)

        # Health metrics
        feature_dict["Stress_Level"] = float(stress_level)
        feature_dict["Blood_Sugar"] = float(blood_sugar)
        feature_dict["BMI"] = float(bmi)

        # Severity encoding
        severity_map = {"mild": 1, "moderate": 2, "severe": 3, "critical": 4}
        feature_dict["Severity_Encoded"] = float(severity_map.get(str(severity).lower(), 0))

        # Activity level encoding
        activity_map = {"sedentary": 0, "low": 1, "moderate": 2, "active": 3, "very_active": 4}
        feature_dict["Activity_Level_Encoded"] = float(activity_map.get(str(activity_level).lower(), 2))

        # Diet type encoding
        diet_map = {"vegetarian": 0, "vegan": 1, "non-vegetarian": 2, "omnivorous": 2}
        feature_dict["Diet_Type_Encoded"] = float(diet_map.get(str(diet_type).lower(), 0))

        # Sleep pattern encoding
        sleep_map = {"good": 0, "moderate": 1, "poor": 2, "insomnia": 3}
        feature_dict["Sleep_Pattern_Encoded"] = float(sleep_map.get(str(sleep_pattern).lower(), 1))

        # Prakriti encoding (one-hot style)
        prakriti_str = str(prakriti).lower() if prakriti else ""
        feature_dict["Prakriti_Vata"] = 1.0 if "vata" in prakriti_str else 0.0
        feature_dict["Prakriti_Pitta"] = 1.0 if "pitta" in prakriti_str else 0.0
        feature_dict["Prakriti_Kapha"] = 1.0 if "kapha" in prakriti_str else 0.0

        # Symptom features (binary)
        if symptoms:
            for symptom_col in self.symptom_columns:
                # Map API keys (lowercase, underscored) to training column names
                api_key = symptom_col.lower().replace(" ", "_").replace("-", "_")
                if api_key in symptoms:
                    feature_dict[symptom_col] = float(symptoms[api_key])

        # Also try matching chief complaint text against symptom columns
        if chief_complaint:
            complaint_lower = chief_complaint.lower()
            for symptom_col in self.symptom_columns:
                col_lower = symptom_col.lower().replace("_", " ")
                if col_lower in complaint_lower and symptom_col not in feature_dict:
                    feature_dict[symptom_col] = 1.0

        # Build ordered feature vector
        features = np.zeros(self.input_dim, dtype=np.float32)
        for i, col in enumerate(self.feature_columns):
            if col in feature_dict:
                features[i] = feature_dict[col]

        # Normalize continuous columns using saved scaler params
        if self.scaler_min is not None and self.scaler_max is not None:
            for j, col in enumerate(self.continuous_columns):
                if col in self.feature_columns:
                    col_idx = self.feature_columns.index(col)
                    if j < len(self.scaler_min):
                        denom = self.scaler_max[j] - self.scaler_min[j]
                        if denom > 0:
                            features[col_idx] = (features[col_idx] - self.scaler_min[j]) / denom
                        else:
                            features[col_idx] = 0.0

        tensor = torch.FloatTensor(features).unsqueeze(0)

        # Inference
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            top_probs, top_idx = torch.topk(probs, min(top_k, self.num_classes), dim=1)

        # Build results
        results = []
        for rank, (prob, idx) in enumerate(
            zip(top_probs[0].tolist(), top_idx[0].tolist()), start=1
        ):
            disease = self.id_to_name.get(idx, "Unknown")
            treatment_info = self._lookup_treatment(disease)
            results.append({
                "rank": rank,
                "disease_name": disease,
                "confidence": round(prob, 6),
                "dosha_involvement": treatment_info.get("dosha_involvement", ""),
                "ayurvedic_name": treatment_info.get("ayurvedic_name", ""),
                "total_cases_in_data": treatment_info.get("total_cases_in_data", 0),
                "treatment": {
                    "herbs": treatment_info.get("herbs", []),
                    "dietary_advice": treatment_info.get("dietary_advice", ""),
                    "lifestyle_changes": treatment_info.get("lifestyle_changes", ""),
                    "panchakarma": treatment_info.get("panchakarma", ""),
                    "yoga_pranayama": treatment_info.get("yoga_pranayama", ""),
                },
            })

        return results

    def _lookup_treatment(self, disease_name: str) -> Dict:
        """Look up treatment info for a disease from the lookup table."""
        if self.treatment_lookup is None or self.treatment_lookup.empty:
            return {}

        matches = self.treatment_lookup[
            self.treatment_lookup["disease_name"].str.lower() == disease_name.lower().strip()
        ]
        if matches.empty:
            return {}

        row = matches.iloc[0]
        herbs_str = str(row.get("herbs", ""))
        herbs = [h.strip() for h in herbs_str.split(",") if h.strip()] if herbs_str else []

        return {
            "dosha_involvement": str(row.get("dosha_involvement", "")),
            "ayurvedic_name": str(row.get("ayurvedic_name", "")),
            "total_cases_in_data": int(row.get("total_cases", 0) or 0),
            "herbs": herbs,
            "dietary_advice": str(row.get("dietary_advice", "")),
            "lifestyle_changes": str(row.get("lifestyle_changes", "")),
            "panchakarma": str(row.get("panchakarma", "")),
            "yoga_pranayama": str(row.get("yoga_pranayama", "")),
        }

    def get_risk_level(self, predictions: List[Dict]) -> str:
        """Determine overall risk level based on top prediction confidence."""
        if not predictions:
            return "low"
        top_confidence = predictions[0].get("confidence", 0)
        if top_confidence > 0.8:
            return "high"
        elif top_confidence > 0.5:
            return "moderate"
        return "low"


# Singleton — imported by main.py
predictor = SymptomTreatmentPredictor()
