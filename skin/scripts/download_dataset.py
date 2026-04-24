import os
import requests
import json
from pathlib import Path
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from io import BytesIO
import sys
import argparse

# Ensure project root is on path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.helpers import get_hf_token

DEFAULT_DATASET = "Nagabu/HAM10000"
API_URL = "https://datasets-server.huggingface.co/rows"
BATCH_SIZE = 100
OUTPUT_DIR = Path("data/raw")
NUM_WORKERS = 8


def get_headers():
    token = get_hf_token()
    return {"Authorization": f"Bearer {token}"}


def fetch_rows(dataset_name, offset, length):
    params = {
        "dataset": dataset_name,
        "config": "default",
        "split": "train",
        "offset": offset,
        "length": length,
    }
    try:
        response = requests.get(API_URL, headers=get_headers(), params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching metadata at offset {offset}: {e}")
        return None


def download_image(url, save_path):
    if save_path.exists():
        return True  # Already cached

    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")
        img.save(save_path)
        return True
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser(description="Download HuggingFace skin dataset to disk")
    parser.add_argument("--dataset", type=str, default=DEFAULT_DATASET,
                        help=f"HF dataset name (default: {DEFAULT_DATASET})")
    parser.add_argument("--max_samples", type=int, default=None,
                        help="Max images to download (None = all)")
    parser.add_argument("--workers", type=int, default=NUM_WORKERS,
                        help=f"Download threads (default: {NUM_WORKERS})")
    args = parser.parse_args()

    dataset_name = args.dataset
    max_samples = args.max_samples

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Downloading dataset: {dataset_name}")
    print(f"Output: {OUTPUT_DIR.resolve()}")
    if max_samples:
        print(f"Max samples: {max_samples}")

    offset = 0
    total_downloaded = 0
    failures = 0
    futures = []

    pbar = tqdm(desc="Fetching Metadata", unit="batch")

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        while True:
            if max_samples and offset >= max_samples:
                break

            data = fetch_rows(dataset_name, offset, BATCH_SIZE)
            if not data or "rows" not in data or not data["rows"]:
                break

            rows = data["rows"]
            if not rows:
                break

            for item in rows:
                row = item["row"]

                # Extract URL
                img_info = row.get("image", {})
                img_url = ""
                if isinstance(img_info, dict) and "src" in img_info:
                    img_url = img_info["src"]
                elif isinstance(img_info, str):
                    img_url = img_info
                elif "image_url" in row:
                    img_url = row["image_url"]

                label = row.get("label")

                if img_url and label is not None:
                    label_str = str(label)
                    class_dir = OUTPUT_DIR / label_str
                    class_dir.mkdir(parents=True, exist_ok=True)

                    filename = f"{item['row_idx']}.jpg"
                    save_path = class_dir / filename

                    future = executor.submit(download_image, img_url, save_path)
                    futures.append(future)

            offset += len(rows)
            pbar.update(1)

            # Flush large queues to keep memory sane
            if len(futures) > 5000:
                print(f"Queue full, waiting for {len(futures)} tasks...")
                for f in as_completed(futures):
                    if f.result():
                        total_downloaded += 1
                    else:
                        failures += 1
                futures = []

        # Wait for remaining
        for future in tqdm(as_completed(futures), total=len(futures), desc="Downloading Images"):
            if future.result():
                total_downloaded += 1
            else:
                failures += 1

    pbar.close()
    print(f"\nDone! Saved {total_downloaded} images to '{OUTPUT_DIR}'. Failed: {failures}")


if __name__ == "__main__":
    main()
