"""
Ayurvedic Herb Model — Inference Engine
Loads the trained .pth model + metadata, rebuilds TF-IDF vectorizer,
and provides prediction and lookup functions for the FastAPI service.
"""

import json
import os
import logging
import numpy as np
import pandas as pd
import torch
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer

from app.model import HerbKnowledgeModel

logger = logging.getLogger(__name__)


class HerbPredictor:
    """
    Loads Ayurvedic model artifacts and serves predictions.
    Initialized once at FastAPI startup.
    """

    def __init__(self):
        self.model: Optional[HerbKnowledgeModel] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.id_to_name: Dict[int, str] = {}
        self.name_to_id: Dict[str, int] = {}
        self.herb_lookup: Optional[pd.DataFrame] = None
        self.num_classes: int = 0
        self.input_dim: int = 0
        self.numeric_columns: List[str] = []
        self._loaded: bool = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def total_herbs(self) -> int:
        return self.num_classes

    def load(self, model_dir: str) -> None:
        """
        Load all artifacts:
          - herb_model.pth        (PyTorch state dict)
          - model_metadata.json   (label mappings, TF-IDF vocab, config)
          - herb_lookup.csv       (full Ayurvedic info for responses)
        """
        logger.info(f"📂 Loading Ayurvedic model from: {model_dir}")

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
        self.numeric_columns = metadata.get("numeric_columns", [])

        # 2. Rebuild TF-IDF vectorizer
        vocab = metadata["tfidf_vocabulary"]
        self.vectorizer = TfidfVectorizer(
            max_features=metadata.get("tfidf_max_features", 3000),
            vocabulary={k: int(v) for k, v in vocab.items()},
        )
        self.vectorizer.fit(["dummy"])
        self.vectorizer.vocabulary_ = {k: int(v) for k, v in vocab.items()}

        # 3. Load PyTorch model
        model_path = os.path.join(model_dir, "herb_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weights not found: {model_path}")

        self.model = HerbKnowledgeModel(self.input_dim, self.num_classes)
        state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        logger.info(f"✅ Model loaded: {self.input_dim} → {self.num_classes} classes")

        # 4. Herb lookup table
        lookup_path = os.path.join(model_dir, "herb_lookup.csv")
        if os.path.exists(lookup_path):
            self.herb_lookup = pd.read_csv(lookup_path, encoding="utf-8").fillna("")
            logger.info(f"✅ Lookup table: {len(self.herb_lookup)} herbs")
        else:
            logger.warning("⚠️ herb_lookup.csv not found")
            self.herb_lookup = pd.DataFrame()

        self._loaded = True
        logger.info("🌿 Ayurvedic Herb predictor ready!")

    def predict(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """Given a symptom/dosha text query, return top-K Ayurvedic herb matches."""
        if not self._loaded:
            raise RuntimeError("Model not loaded — call load() first")

        # Vectorize query
        tfidf = self.vectorizer.transform([query_text]).toarray()

        # Dummy numeric dosha features for query (just pad with zeros)
        pad_size = self.input_dim - tfidf.shape[1]
        if pad_size > 0:
            features = np.hstack([tfidf, np.zeros((1, pad_size), dtype=np.float32)])
        else:
            features = tfidf

        tensor = torch.FloatTensor(features)

        # Inference
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            highest_probs, top_idx = torch.topk(probs, min(top_k, self.num_classes), dim=1)

        # Build results with herb details
        results = []
        for rank, (prob, idx) in enumerate(
            zip(highest_probs[0].tolist(), top_idx[0].tolist()), start=1
        ):
            name = self.id_to_name.get(idx, "Unknown")
            info = self._lookup(name)
            if not info:
                # Fallback if somehow not in lookup
                info = {"name": name}

            match_data = {
                "rank": rank,
                "confidence": round(prob, 6),
            }
            match_data.update(info)
            results.append(match_data)
        return results

    def get_herb_by_name(self, name: str) -> Optional[Dict]:
        """Look up a single herb by its name."""
        return self._lookup(name)

    def get_herbs_by_dosha(self, dosha: str, top_k: int = 10) -> List[Dict]:
        """Filter herbs that pacify a specific dosha."""
        if self.herb_lookup is None or self.herb_lookup.empty:
            return []
            
        dosha = dosha.strip().capitalize()
        if dosha not in ["Vata", "Pitta", "Kapha"]:
            return []
            
        # Find herbs where pacify_dosha contains the target dosha OR tridosha is True
        matches = self.herb_lookup[
            self.herb_lookup["pacify_dosha"].str.contains(dosha, case=False, na=False) |
            (self.herb_lookup["tridosha"].astype(str).str.lower() == "true") |
            (self.herb_lookup["tridosha"] == 1)
        ]
        
        results = []
        for _, row in matches.head(top_k).iterrows():
            results.append(self._row_to_dict(row))
            
        return results
        
    def get_herbs_by_rasa(self, rasa: str, top_k: int = 10) -> List[Dict]:
        """Filter herbs by Taste (Rasa)."""
        if self.herb_lookup is None or self.herb_lookup.empty:
            return []
            
        rasa = rasa.strip().capitalize()
        matches = self.herb_lookup[
            self.herb_lookup["rasa"].str.contains(rasa, case=False, na=False)
        ]
        
        results = []
        for _, row in matches.head(top_k).iterrows():
            results.append(self._row_to_dict(row))
            
        return results

    def _lookup(self, name: str) -> Dict:
        if self.herb_lookup is None or self.herb_lookup.empty:
            return {}
        # Case insensitive exact match or substring
        matches = self.herb_lookup[self.herb_lookup["name"].str.lower() == name.lower().strip()]
        if matches.empty:
            return {"name": name}
        return self._row_to_dict(matches.iloc[0])

    def _row_to_dict(self, row: pd.Series) -> Dict:
        tridosha_val = str(row.get("tridosha", "")).lower()
        tridosha_bool = tridosha_val in ["true", "1", "yes"]
        
        return {
            "name": str(row.get("name", "")),
            "latin_name": str(row.get("latin_name", "")),
            "hindi_name": str(row.get("hindi_name", "")),
            "rasa": str(row.get("rasa", "")),
            "guna": str(row.get("guna", "")),
            "virya": str(row.get("virya", "")),
            "vipaka": str(row.get("vipaka", "")),
            "prabhava": str(row.get("prabhava", "")),
            "pacify_dosha": str(row.get("pacify_dosha", "")),
            "aggravate_dosha": str(row.get("aggravate_dosha", "")),
            "tridosha": tridosha_bool,
            "category": str(row.get("category", "")),
            "therapeutic_uses": str(row.get("therapeutic_uses", "")),
            "contraindications": str(row.get("contraindications", "")),
            "preview": str(row.get("preview", "")),
            "source_url": str(row.get("source_url", "")),
        }


# Singleton — imported by main.py
predictor = HerbPredictor()
