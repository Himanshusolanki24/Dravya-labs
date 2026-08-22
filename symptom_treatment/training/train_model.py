"""Train the symptom-to-treatment classifier with TensorFlow/Keras."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

from app.model import build_symptom_treatment_model

ROOT = Path(__file__).resolve().parents[1]
tf.keras.utils.set_random_seed(42)


def main() -> None:
    datasets = sorted((ROOT / "dataset").glob("*.csv"))
    if not datasets:
        raise FileNotFoundError("No CSV dataset found in symptom_treatment/dataset")
    df = pd.read_csv(datasets[0]).fillna(0)
    target = next((column for column in ("Disease", "Diagnosis", "Condition", "Label", "Target") if column in df.columns), None)
    if target is None:
        target = next((column for column in df.columns if "disease" in column.lower() or "diagnos" in column.lower()), df.columns[-1])
    treatment_columns = [column for column in df.columns if any(key in column.lower() for key in ("treatment", "herb", "diet", "lifestyle", "yoga", "panchakarma", "dosha"))]
    feature_frame = df.drop(columns=[target] + treatment_columns).copy()
    categorical = []
    for column in feature_frame.columns:
        if not pd.api.types.is_numeric_dtype(feature_frame[column]):
            categorical.append(column)
            feature_frame[column] = LabelEncoder().fit_transform(feature_frame[column].astype(str))
        else:
            feature_frame[column] = pd.to_numeric(feature_frame[column], errors="coerce").fillna(0)
    continuous = [column for column in feature_frame.columns if column not in categorical and feature_frame[column].nunique() > 2]
    binary = [column for column in feature_frame.columns if column not in continuous]
    scaler = MinMaxScaler()
    if continuous:
        feature_frame[continuous] = scaler.fit_transform(feature_frame[continuous])
    labels = LabelEncoder(); y = labels.fit_transform(df[target].astype(str))
    x = feature_frame.astype("float32").to_numpy()
    order = np.random.RandomState(42).permutation(len(x))
    x, y = x[order], y[order]
    output_dir = ROOT / "model"; output_dir.mkdir(exist_ok=True)
    model = build_symptom_treatment_model(x.shape[1], len(labels.classes_))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    history = model.fit(x, y, validation_split=0.2, epochs=200, batch_size=64, verbose=2,
              callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=25, restore_best_weights=True),
                         tf.keras.callbacks.ModelCheckpoint(output_dir / "symptom_treatment_model.keras", monitor="val_accuracy", mode="max", save_best_only=True)])
    print(json.dumps({
        "model": "symptom_treatment",
        "samples": int(len(x)),
        "num_classes": int(len(labels.classes_)),
        "input_dim": int(x.shape[1]),
        "epochs_ran": len(history.history["accuracy"]),
        "best_train_accuracy": round(float(max(history.history["accuracy"])), 4),
        "best_val_accuracy": round(float(max(history.history["val_accuracy"])), 4),
        "final_val_loss": round(float(history.history["val_loss"][int(np.argmax(history.history["val_accuracy"]))]), 4),
    }))
    rename_map = {target: "disease_name"}
    for column in treatment_columns:
        lower = column.lower()
        if "herb" in lower or "medicine" in lower: rename_map[column] = "herbs"
        elif "diet" in lower: rename_map[column] = "dietary_advice"
        elif "lifestyle" in lower: rename_map[column] = "lifestyle_changes"
        elif "panchakarma" in lower: rename_map[column] = "panchakarma"
        elif "yoga" in lower or "pranayama" in lower: rename_map[column] = "yoga_pranayama"
        elif "dosha" in lower: rename_map[column] = "dosha_involvement"
    lookup = df[[target] + treatment_columns].drop_duplicates(target).rename(columns=rename_map)
    counts = df[target].value_counts().rename_axis("disease_name").reset_index(name="total_cases")
    lookup.merge(counts, on="disease_name", how="left").to_csv(output_dir / "treatment_lookup.csv", index=False)
    metadata = {"num_classes": len(labels.classes_), "input_dim": x.shape[1], "feature_columns": feature_frame.columns.tolist(),
                "continuous_columns": continuous, "binary_columns": binary, "categorical_columns": categorical, "gender_map": {"Male": 0, "Female": 1},
                "symptom_columns": [column for column in binary if any(word in column.lower() for word in ("pain", "fever", "ache", "symptom"))],
                "scaler_params": {"min": scaler.data_min_.tolist() if continuous else [], "max": scaler.data_max_.tolist() if continuous else [], "columns": continuous},
                "id_to_name": {str(i): name for i, name in enumerate(labels.classes_)}, "name_to_id": {name: int(i) for i, name in enumerate(labels.classes_)}, "framework": "tensorflow"}
    (output_dir / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
