"""Train Brahma with TensorFlow/Keras and export portable `.keras` artifacts."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder

from app.model import build_brahma_model

ROOT = Path(__file__).resolve().parents[1]
tf.keras.utils.set_random_seed(42)


def main() -> None:
    csv_path = ROOT / "Updated_Prakriti_With_Features.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()
    target = "Dosha"
    if target not in df:
        raise ValueError(f"Expected target column '{target}'")
    df = df.dropna(subset=[target]).copy()
    df[target] = df[target].astype(str).str.strip().str.lower()
    features = [column for column in df.columns if column != target]
    feature_classes = {}
    encoded = []
    for column in features:
        values = df[column].fillna("").astype(str).str.strip().str.lower()
        encoder = LabelEncoder()
        encoded.append(encoder.fit_transform(values))
        feature_classes[column] = encoder.classes_.tolist()
    x = np.column_stack(encoded).astype("float32")
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df[target])
    order = np.random.RandomState(42).permutation(len(x))
    x, y = x[order], y[order]
    model = build_brahma_model(x.shape[1], len(label_encoder.classes_))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    output_dir = ROOT / "model"
    output_dir.mkdir(exist_ok=True)
    checkpoint = output_dir / "brahma_model.keras"
    history = model.fit(x, y, validation_split=0.2, epochs=200, batch_size=64, verbose=2,
              callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=25, restore_best_weights=True),
                         tf.keras.callbacks.ModelCheckpoint(checkpoint, monitor="val_accuracy", mode="max", save_best_only=True)])
    print(json.dumps({
        "model": "brahma",
        "samples": int(len(x)),
        "num_classes": int(len(label_encoder.classes_)),
        "input_dim": int(x.shape[1]),
        "epochs_ran": len(history.history["accuracy"]),
        "best_train_accuracy": round(float(max(history.history["accuracy"])), 4),
        "best_val_accuracy": round(float(max(history.history["val_accuracy"])), 4),
        "final_val_loss": round(float(history.history["val_loss"][int(np.argmax(history.history["val_accuracy"]))]), 4),
    }))
    metadata = {
        "num_classes": len(label_encoder.classes_), "input_dim": x.shape[1], "features": features,
        "feature_classes": feature_classes,
        "id_to_name": {str(i): name for i, name in enumerate(label_encoder.classes_)},
        "name_to_id": {name: int(i) for i, name in enumerate(label_encoder.classes_)}, "framework": "tensorflow",
    }
    (output_dir / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    lookup = df.groupby(target)[features].agg(lambda series: series.mode().iloc[0]).reset_index()
    lookup.to_csv(output_dir / "dosha_lookup.csv", index=False)


if __name__ == "__main__":
    main()
