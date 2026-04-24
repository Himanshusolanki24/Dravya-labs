"""
Autoimmune Model — Inference Engine
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

from app.model import AutoimmuneModel

logger = logging.getLogger(__name__)


# ─── Symptom / Antibody name mappings ─────────────────────────
# Maps API-friendly keys → CSV column names
SYMPTOM_KEY_MAP = {
    "low_grade_fever": "Low-grade fever",
    "fatigue": "Fatigue or chronic tiredness",
    "dizziness": "Dizziness",
    "weight_loss": "Weight loss",
    "rashes": "Rashes and skin lesions",
    "joint_stiffness": "Stiffness in the joints",
    "hair_loss": "Brittle hair or hair loss",
    "dry_eyes_mouth": "Dry eyes and/or mouth",
    "unwell_feeling": "General 'unwell' feeling",
    "joint_pain": "Joint pain",
}

ANTIBODY_KEY_MAP = {
    "anti_dsdna_orig": "Anti-dsDNA",
    "anti_sm_orig": "Anti-Sm",
    "rheumatoid_factor": "Rheumatoid factor",
    "acpa": "ACPA",
    "anti_tpo": "Anti-TPO",
    "anti_tg": "Anti-Tg",
    "anti_sma_orig": "Anti-SMA",
    "anti_dsdna": "Anti_dsDNA",
    "anti_enterocyte": "Anti_enterocyte_antibodies",
    "anti_lkm1": "anti_LKM1",
    "anti_rnp": "Anti_RNP",
    "asca": "ASCA",
    "anti_ro_ssa": "Anti_Ro_SSA",
    "anti_cbir1": "Anti_CBir1",
    "anti_bp230": "Anti_BP230",
    "anti_ttg": "Anti_tTG",
    "dgp": "DGP",
    "anti_bp180": "Anti_BP180",
    "asma": "ASMA",
    "anti_if": "Anti_IF",
    "igg_ige_receptor": "IgG_IgE_receptor",
    "anti_srp": "Anti_SRP",
    "anti_desmoglein_3": "Anti_desmoglein_3",
    "anti_la_ssb": "Anti_La_SSB",
    "anti_jo1": "Anti_Jo1",
    "anca": "ANCA",
    "anti_centromere": "anti_centromere",
    "anti_desmoglein_1": "Anti_desmoglein_1",
    "ema": "EMA",
    "anti_type_vii_collagen": "Anti_type_VII_collagen",
    "c1_inhibitor": "C1_inhibitor",
    "anti_tif1": "Anti_TIF1",
    "anti_epidermal_bm_iga": "Anti_epidermal_basement_membrane_IgA",
    "anti_ompc": "Anti_OmpC",
    "panca": "pANCA",
    "anti_tissue_tg": "Anti_tissue_transglutaminase",
    "anti_scl_70": "anti_Scl_70",
    "anti_mi2": "Anti_Mi2",
    "anti_parietal_cell": "Anti_parietal_cell",
    "progesterone_ab": "Progesterone_antibodies",
    "anti_sm": "Anti_Sm",
}


class AutoimmunePredictor:
    """
    Loads model artifacts and serves predictions.
    Initialized once at FastAPI startup.
    """

    def __init__(self):
        self.model: Optional[AutoimmuneModel] = None
        self.id_to_name: Dict[int, str] = {}
        self.name_to_id: Dict[str, int] = {}
        self.disease_lookup: Optional[pd.DataFrame] = None
        self.num_classes: int = 0
        self.input_dim: int = 0
        self.feature_columns: List[str] = []
        self.continuous_columns: List[str] = []
        self.binary_columns: List[str] = []
        self.categorical_columns: List[str] = []
        self.scaler_min: Optional[np.ndarray] = None
        self.scaler_max: Optional[np.ndarray] = None
        self.gender_map: Dict[str, int] = {}
        self._loaded: bool = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def total_diseases(self) -> int:
        return self.num_classes

    def load(self, model_dir: str) -> None:
        """
        Load all artifacts:
          - autoimmune_model.pth   (PyTorch state dict)
          - model_metadata.json    (label mappings, scaler params, feature config)
          - disease_lookup.csv     (disease info for responses)
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
        self.continuous_columns = metadata["continuous_columns"]
        self.binary_columns = metadata["binary_columns"]
        self.categorical_columns = metadata.get("categorical_columns", [])
        self.gender_map = metadata.get("gender_map", {"Male": 0, "Female": 1})

        # Scaler params for normalizing continuous features
        scaler = metadata["scaler_params"]
        self.scaler_min = np.array(scaler["min"], dtype=np.float32)
        self.scaler_max = np.array(scaler["max"], dtype=np.float32)

        # 2. Load PyTorch model
        model_path = os.path.join(model_dir, "autoimmune_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weights not found: {model_path}")

        self.model = AutoimmuneModel(self.input_dim, self.num_classes)
        state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        logger.info(f"✅ Model loaded: {self.input_dim} → {self.num_classes} classes")

        # 3. Disease lookup table
        lookup_path = os.path.join(model_dir, "disease_lookup.csv")
        if os.path.exists(lookup_path):
            self.disease_lookup = pd.read_csv(lookup_path, encoding="utf-8").fillna("")
            logger.info(f"✅ Lookup table: {len(self.disease_lookup)} diseases")
        else:
            logger.warning("⚠️ disease_lookup.csv not found")
            self.disease_lookup = pd.DataFrame()

        self._loaded = True
        logger.info("🧬 Autoimmune predictor ready!")

    def predict(
        self,
        age: int,
        gender: str,
        sickness_duration: float = 0,
        lab_values: Optional[Dict[str, float]] = None,
        symptoms: Optional[Dict[str, int]] = None,
        antibodies: Optional[Dict[str, int]] = None,
        top_k: int = 5,
    ) -> List[Dict]:
        """
        Given patient data, return top-K autoimmune disorder predictions.
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded — call load() first")

        # Build the feature vector in the same order as training
        feature_dict: Dict[str, float] = {}

        # Categorical: Gender
        feature_dict["Gender"] = float(self.gender_map.get(gender, 0))

        # Continuous: age, duration, lab values
        feature_dict["Age"] = float(age)
        feature_dict["Sickness_Duration_Months"] = float(sickness_duration)

        # Lab value column mapping (API field → CSV column)
        lab_col_map = {
            "rbc_count": "RBC_Count",
            "hemoglobin": "Hemoglobin",
            "hematocrit": "Hematocrit",
            "mcv": "MCV",
            "mch": "MCH",
            "mchc": "MCHC",
            "rdw": "RDW",
            "reticulocyte_count": "Reticulocyte_Count",
            "wbc_count": "WBC_Count",
            "neutrophils": "Neutrophils",
            "lymphocytes": "Lymphocytes",
            "monocytes": "Monocytes",
            "eosinophils": "Eosinophils",
            "basophils": "Basophils",
            "plt_count": "PLT_Count",
            "mpv": "MPV",
            "ana": "ANA",
            "esbach": "Esbach",
            "mbl_level": "MBL_Level",
            "esr": "ESR",
            "c3": "C3",
            "c4": "C4",
            "crp": "CRP",
        }

        if lab_values:
            for api_key, csv_col in lab_col_map.items():
                if api_key in lab_values:
                    feature_dict[csv_col] = float(lab_values[api_key])

        # Symptoms (binary)
        if symptoms:
            for api_key, csv_col in SYMPTOM_KEY_MAP.items():
                if api_key in symptoms:
                    feature_dict[csv_col] = float(symptoms[api_key])

        # Antibodies (binary)
        if antibodies:
            for api_key, csv_col in ANTIBODY_KEY_MAP.items():
                if api_key in antibodies:
                    feature_dict[csv_col] = float(antibodies[api_key])

        # Build ordered feature vector
        features = np.zeros(self.input_dim, dtype=np.float32)
        for i, col in enumerate(self.feature_columns):
            if col in feature_dict:
                features[i] = feature_dict[col]

        # Normalize continuous columns using saved scaler params
        # Find indices of continuous columns in feature_columns
        for j, col in enumerate(self.continuous_columns):
            col_idx = self.feature_columns.index(col) if col in self.feature_columns else -1
            if col_idx >= 0:
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
            info = self._lookup(disease)
            results.append({
                "rank": rank,
                "disease_name": disease,
                "confidence": round(prob, 6),
                "total_cases_in_data": info.get("total_cases_in_data", 0),
                "common_symptoms": info.get("common_symptoms", ""),
                "avg_duration_months": info.get("avg_duration_months", 0),
                "gender_distribution": info.get("gender_distribution", ""),
            })
        return results

    def get_disease_by_name(self, name: str) -> Optional[Dict]:
        """Look up a single disease by name."""
        if self.disease_lookup is None or self.disease_lookup.empty:
            return None
        matches = self.disease_lookup[
            self.disease_lookup["disease_name"].str.lower() == name.lower().strip()
        ]
        if matches.empty:
            return None
        return self._row_to_dict(matches.iloc[0])

    def _lookup(self, disease_name: str) -> Dict:
        if self.disease_lookup is None or self.disease_lookup.empty:
            return {}
        matches = self.disease_lookup[self.disease_lookup["disease_name"] == disease_name]
        if matches.empty:
            return {}
        return self._row_to_dict(matches.iloc[0])

    def _row_to_dict(self, row: pd.Series) -> Dict:
        return {
            "total_cases_in_data": int(row.get("total_cases", 0) or 0),
            "common_symptoms": str(row.get("common_symptoms", "")),
            "avg_duration_months": float(row.get("avg_duration_months", 0) or 0),
            "gender_distribution": str(row.get("gender_distribution", "")),
        }


# Singleton — imported by main.py
predictor = AutoimmunePredictor()
