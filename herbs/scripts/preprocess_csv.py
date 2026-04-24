"""
Herb CSV Preprocessor
---------------------
Cleans the PFAF CSV, engineers features, and saves processed files
ready for model training.

Usage:
    python preprocess_csv.py --input ../../pfaf_plants_hindi.csv --output ../data
"""

import argparse
import os
import sys
import json
import pandas as pd
import numpy as np
from typing import Tuple, Dict


# ─── Column Config ────────────────────────────────────────────

TEXT_COLUMNS = [
    "use_keyword",
    "Medicinal Properties",
    "Edible Uses",
    "Cultivation Details",
    "Summary",
    "Known Hazards",
    "Other Uses",
    "Special Uses",
    "Common Name",
    "Family",
    "Native Range",
    "Propagation",
]

NUMERIC_COLUMNS = [
    "edibility_rating_search",
    "medicinal_rating_search",
]

ID_COLUMN = "latin_name_search"
HINDI_COLUMN = "hindi_name"
COMMON_NAME_COLUMN = "common_name_search"


def load_csv(filepath: str) -> pd.DataFrame:
    """Load the raw PFAF CSV."""
    print(f"📂 Loading CSV: {filepath}")
    df = pd.read_csv(filepath, encoding="utf-8", low_memory=False)
    print(f"   Raw rows: {len(df)}, Columns: {len(df.columns)}")
    return df


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Drop invalids, fill NaN, normalize text, deduplicate."""
    initial = len(df)

    # Drop rows without latin name
    df = df.dropna(subset=[ID_COLUMN])
    df = df[df[ID_COLUMN].str.strip() != ""]
    print(f"   After dropping empty latin names: {len(df)} (removed {initial - len(df)})")

    # Fill NaN text with ""
    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str)

    # Fill NaN numeric with 0
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    if HINDI_COLUMN in df.columns:
        df[HINDI_COLUMN] = df[HINDI_COLUMN].fillna("")

    # Normalize whitespace
    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].str.replace(r"\s+", " ", regex=True).str.strip()

    # Deduplicate
    before = len(df)
    df = df.drop_duplicates(subset=[ID_COLUMN], keep="first")
    print(f"   After dedup: {len(df)} (removed {before - len(df)})")

    return df.reset_index(drop=True)


def build_combined_text(df: pd.DataFrame) -> pd.Series:
    """Concat all text columns into single feature string."""
    parts = [df[col] for col in TEXT_COLUMNS if col in df.columns]
    combined = parts[0]
    for p in parts[1:]:
        combined = combined + " " + p
    return combined.str.replace(r"\s+", " ", regex=True).str.strip()


def build_label_mapping(df: pd.DataFrame) -> Tuple[pd.Series, Dict[int, str], Dict[str, int]]:
    """Encode latin names as integer labels."""
    unique = sorted(df[ID_COLUMN].unique())
    name_to_id = {name: idx for idx, name in enumerate(unique)}
    id_to_name = {idx: name for name, idx in name_to_id.items()}
    encoded = df[ID_COLUMN].map(name_to_id)
    print(f"   Classes: {len(unique)}")
    return encoded, id_to_name, name_to_id


def process_csv(input_path: str, output_dir: str) -> Dict:
    """Full preprocessing pipeline."""
    os.makedirs(output_dir, exist_ok=True)

    df = load_csv(input_path)
    df = clean_dataframe(df)
    df["combined_text"] = build_combined_text(df)
    df["label"], id_to_name, name_to_id = build_label_mapping(df)

    # Save processed CSV
    keep = [ID_COLUMN, COMMON_NAME_COLUMN, "label", "combined_text"] + NUMERIC_COLUMNS
    if HINDI_COLUMN in df.columns:
        keep.append(HINDI_COLUMN)
    extra = ["Family", "Medicinal Properties", "Edible Uses", "plant_url", "Known Hazards", "Summary"]
    keep += [c for c in extra if c in df.columns and c not in keep]

    processed = df[[c for c in keep if c in df.columns]].copy()
    processed.to_csv(os.path.join(output_dir, "processed_herbs.csv"), index=False, encoding="utf-8")
    print(f"✅ Saved processed CSV ({len(processed)} rows)")

    # Save label metadata
    metadata = {
        "num_classes": len(id_to_name),
        "num_samples": len(processed),
        "text_columns_used": TEXT_COLUMNS,
        "numeric_columns_used": NUMERIC_COLUMNS,
        "id_to_name": {str(k): v for k, v in id_to_name.items()},
        "name_to_id": name_to_id,
    }
    with open(os.path.join(output_dir, "label_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print("✅ Saved label_metadata.json")

    # Save herb lookup table (full info for API responses)
    lookup_cols = [ID_COLUMN, COMMON_NAME_COLUMN]
    if HINDI_COLUMN in df.columns:
        lookup_cols.append(HINDI_COLUMN)
    lookup_cols += ["Family", "Medicinal Properties", "Edible Uses",
                    "Known Hazards", "Summary", "plant_url"] + NUMERIC_COLUMNS
    lookup_cols = [c for c in lookup_cols if c in df.columns]
    df[lookup_cols].to_csv(os.path.join(output_dir, "herb_lookup.csv"), index=False, encoding="utf-8")
    print("✅ Saved herb_lookup.csv")

    return metadata


def main():
    parser = argparse.ArgumentParser(description="Preprocess PFAF CSV for herb model training")
    parser.add_argument("--input", "-i",
                        default=os.path.join(os.path.dirname(__file__), "..", "..", "pfaf_plants_hindi.csv"))
    parser.add_argument("--output", "-o",
                        default=os.path.join(os.path.dirname(__file__), "..", "data"))
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output)

    if not os.path.exists(input_path):
        print(f"❌ File not found: {input_path}")
        sys.exit(1)

    print("=" * 60)
    print("  PFAF Herb CSV Preprocessor")
    print("=" * 60)
    meta = process_csv(input_path, output_dir)
    print(f"\n✅ Done! {meta['num_samples']} herbs → {meta['num_classes']} classes")


if __name__ == "__main__":
    main()
