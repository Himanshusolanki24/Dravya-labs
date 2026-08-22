"""Train the Ayurvedic herb classifier with TensorFlow/Keras."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

from app.model import build_herb_model

ROOT = Path(__file__).resolve().parents[1]
TEXT_COLUMNS = ["preview", "rasa", "guna", "virya", "vipaka", "prabhava", "therapeutic_uses", "category", "contraindications", "pacify_dosha", "aggravate_dosha"]
NUMERIC_COLUMNS = ["pacify_vata", "pacify_pitta", "pacify_kapha", "aggravate_vata", "aggravate_pitta", "aggravate_kapha", "tridosha_flag"]
tf.keras.utils.set_random_seed(42)


def main() -> None:
    csv_path = ROOT / "ayurvedic_herbs.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path, encoding="utf-8", low_memory=False).dropna(subset=["name"]).copy()
    df = df[df["name"].astype(str).str.strip() != ""].drop_duplicates("name").reset_index(drop=True)
    existing_text = [column for column in TEXT_COLUMNS if column in df]
    combined = df[existing_text].fillna("").astype(str).agg(" ".join, axis=1)
    if "tridosha" in df:
        df["tridosha_flag"] = df["tridosha"].astype(str).str.lower().isin(("true", "1", "yes")).astype("float32")
    for column in NUMERIC_COLUMNS:
        df[column] = pd.to_numeric(df.get(column, 0), errors="coerce").fillna(0)
    vectorizer = TfidfVectorizer(max_features=3000, stop_words="english", ngram_range=(1, 2), sublinear_tf=True)
    text_values = vectorizer.fit_transform(combined).toarray().astype("float32")
    x = np.hstack((text_values, df[NUMERIC_COLUMNS].to_numpy(dtype="float32")))
    labels = LabelEncoder(); y = labels.fit_transform(df["name"].astype(str))
    order = np.random.RandomState(42).permutation(len(x))
    x, y = x[order], y[order]
    output_dir = ROOT / "model"; output_dir.mkdir(exist_ok=True)
    model = build_herb_model(x.shape[1], len(labels.classes_))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    history = model.fit(x, y, validation_split=0.2, epochs=200, batch_size=64, verbose=2,
              callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=25, restore_best_weights=True),
                         tf.keras.callbacks.ModelCheckpoint(output_dir / "herb_model.keras", monitor="val_accuracy", mode="max", save_best_only=True)])
    print(json.dumps({
        "model": "herbs",
        "samples": int(len(x)),
        "num_classes": int(len(labels.classes_)),
        "input_dim": int(x.shape[1]),
        "epochs_ran": len(history.history["accuracy"]),
        "best_train_accuracy": round(float(max(history.history["accuracy"])), 4),
        "best_val_accuracy": round(float(max(history.history["val_accuracy"])), 4),
        "final_val_loss": round(float(history.history["val_loss"][int(np.argmax(history.history["val_accuracy"]))]), 4),
    }))
    metadata = {"num_classes": len(labels.classes_), "input_dim": x.shape[1], "tfidf_max_features": 3000,
                "tfidf_vocabulary": {key: int(value) for key, value in vectorizer.vocabulary_.items()}, "numeric_columns": NUMERIC_COLUMNS,
                "id_to_name": {str(i): name for i, name in enumerate(labels.classes_)}, "name_to_id": {name: int(i) for i, name in enumerate(labels.classes_)}, "framework": "tensorflow"}
    (output_dir / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    lookup_columns = [column for column in ("name", "latin_name", "hindi_name", *TEXT_COLUMNS, "tridosha", "source_url") if column in df]
    df[lookup_columns].to_csv(output_dir / "herb_lookup.csv", index=False, encoding="utf-8")


if __name__ == "__main__":
    main()
