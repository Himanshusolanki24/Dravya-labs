"""Train the autoimmune service with TensorFlow/Keras."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

from app.model import build_autoimmune_model

ROOT = Path(__file__).resolve().parents[1]
TARGET = "Diagnosis"
tf.keras.utils.set_random_seed(42)


def main() -> None:
    csv_path = ROOT / "Autoimmune_Disorder_10k_with_All_Disorders.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path).dropna(subset=[TARGET]).copy()
    df["Gender"] = df.get("Gender", "Male").astype(str).map({"Male": 0, "Female": 1}).fillna(0)
    feature_columns = [column for column in df.columns if column != TARGET]
    continuous = [column for column in feature_columns if pd.api.types.is_numeric_dtype(df[column]) and df[column].nunique() > 2]
    binary = [column for column in feature_columns if column not in continuous and column != "Gender"]
    for column in continuous + binary:
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0)
    scaler = MinMaxScaler()
    if continuous:
        df[continuous] = scaler.fit_transform(df[continuous])
    x = df[feature_columns].astype("float32").to_numpy()
    labels = LabelEncoder(); y = labels.fit_transform(df[TARGET].astype(str))
    order = np.random.RandomState(42).permutation(len(x))
    x, y = x[order], y[order]
    model = build_autoimmune_model(x.shape[1], len(labels.classes_))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    output_dir = ROOT / "model"; output_dir.mkdir(exist_ok=True)
    history = model.fit(x, y, validation_split=0.2, epochs=200, batch_size=256, verbose=2,
              callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=25, restore_best_weights=True),
                         tf.keras.callbacks.ModelCheckpoint(output_dir / "autoimmune_model.keras", monitor="val_accuracy", mode="max", save_best_only=True)])
    print(json.dumps({
        "model": "autoimmune",
        "samples": int(len(x)),
        "num_classes": int(len(labels.classes_)),
        "input_dim": int(x.shape[1]),
        "epochs_ran": len(history.history["accuracy"]),
        "best_train_accuracy": round(float(max(history.history["accuracy"])), 4),
        "best_val_accuracy": round(float(max(history.history["val_accuracy"])), 4),
        "final_val_loss": round(float(history.history["val_loss"][int(np.argmax(history.history["val_accuracy"]))]), 4),
    }))
    metadata = {"num_classes": len(labels.classes_), "input_dim": x.shape[1], "feature_columns": feature_columns,
                "continuous_columns": continuous, "binary_columns": binary, "categorical_columns": ["Gender"], "gender_map": {"Male": 0, "Female": 1},
                "scaler_params": {"min": scaler.data_min_.tolist() if continuous else [], "max": scaler.data_max_.tolist() if continuous else [], "columns": continuous},
                "id_to_name": {str(i): name for i, name in enumerate(labels.classes_)}, "name_to_id": {name: int(i) for i, name in enumerate(labels.classes_)}, "framework": "tensorflow"}
    (output_dir / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    df.assign(**{TARGET: df[TARGET].astype(str)}).groupby(TARGET).size().rename("total_cases").reset_index().rename(columns={TARGET: "disease_name"}).to_csv(output_dir / "disease_lookup.csv", index=False)


if __name__ == "__main__":
    main()
