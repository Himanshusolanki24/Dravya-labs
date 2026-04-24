import requests
import io
import os
from pathlib import Path
from PIL import Image
from torch.utils.data import Dataset
from typing import List, Dict, Tuple, Optional
from utils.helpers import get_hf_token
from utils.logger import logger


class HFSkinDataset(Dataset):
    """
    A PyTorch Dataset that loads skin disease images from HuggingFace Datasets API.

    Workflow:
    1. Fetches metadata from HuggingFace Datasets Server API (pagination).
    2. Checks for local cached images at data/raw/{label}/{row_idx}.jpg.
    3. Falls back to downloading on-the-fly if not cached locally.

    Supports any HF image classification dataset with 'image' and 'label' fields.
    Default: Nagabu/HAM10000 (public, 2-class: Melanoma vs Nevus)
    Alternative: redlessone/Derm1M (gated, 390+ classes)
    """

    API_URL = "https://datasets-server.huggingface.co/rows"
    LOCAL_DIR = Path("data/raw")

    def __init__(
        self,
        dataset_name: str = "Nagabu/HAM10000",
        config_name: str = "default",
        split: str = "train",
        transform=None,
        max_samples: Optional[int] = None,
        label_field: str = "label",
        image_field: str = "image",
    ):
        self.dataset_name = dataset_name
        self.config_name = config_name
        self.split = split
        self.transform = transform
        self.label_field = label_field
        self.image_field = image_field

        self.token = get_hf_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}

        self.samples: List[Dict] = []
        self.class_to_idx: Dict[str, int] = {}
        self.classes: List[str] = []

        logger.info(f"Initializing HFSkinDataset for {dataset_name} [{split}]...")
        self._fetch_all_rows(max_samples)
        self._build_class_mapping()
        logger.info(
            f"Dataset ready: {len(self.samples)} samples, {len(self.classes)} classes."
        )

    def _fetch_all_rows(self, max_samples: Optional[int]):
        """Fetches rows from HF API using pagination."""
        offset = 0
        length = 100  # Batch size for API

        while True:
            if max_samples and offset >= max_samples:
                break

            params = {
                "dataset": self.dataset_name,
                "config": self.config_name,
                "split": self.split,
                "offset": offset,
                "length": length,
            }

            try:
                response = requests.get(
                    self.API_URL, headers=self.headers, params=params, timeout=15
                )
                response.raise_for_status()
                data = response.json()

                rows = data.get("rows", [])
                if not rows:
                    break

                for row in rows:
                    self.samples.append(row)

                offset += len(rows)
                if offset % 500 == 0:
                    logger.info(f"Fetched {offset} rows...")

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching data from HF API at offset {offset}: {e}")
                break

    def _build_class_mapping(self):
        """Extracts unique labels and builds class ↔ index mapping."""
        unique_labels = set()
        for sample in self.samples:
            row_data = sample["row"]
            label = row_data.get(self.label_field)
            if label is not None:
                unique_labels.add(str(label))

        self.classes = sorted(list(unique_labels))
        self.class_to_idx = {cls_name: idx for idx, cls_name in enumerate(self.classes)}

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample_wrapper = self.samples[idx]
        sample_data = sample_wrapper["row"]
        row_idx = sample_wrapper["row_idx"]

        label_val = str(sample_data.get(self.label_field, "unknown"))
        label_idx = self.class_to_idx.get(label_val, 0)

        # 1. Try local cached image
        local_path = self.LOCAL_DIR / label_val / f"{row_idx}.jpg"

        image = None
        if local_path.exists():
            try:
                image = Image.open(local_path).convert("RGB")
            except Exception as e:
                logger.warning(f"Corrupt local file {local_path}: {e}")

        # 2. Remote fallback
        if image is None:
            img_field = sample_data.get(self.image_field, {})
            img_url = ""
            if isinstance(img_field, dict) and "src" in img_field:
                img_url = img_field["src"]
            elif isinstance(img_field, str):
                img_url = img_field
            elif "image_url" in sample_data:
                img_url = sample_data["image_url"]

            if img_url:
                try:
                    resp = requests.get(img_url, headers=self.headers, timeout=10)
                    resp.raise_for_status()
                    image = Image.open(io.BytesIO(resp.content)).convert("RGB")
                except Exception as e:
                    logger.warning(f"Failed to download image (row {row_idx}): {e}")

        # 3. Black placeholder on total failure
        if image is None:
            logger.warning(f"No image for row {row_idx}, using black placeholder.")
            image = Image.new("RGB", (224, 224), (0, 0, 0))

        if self.transform:
            image = self.transform(image)

        return image, label_idx
