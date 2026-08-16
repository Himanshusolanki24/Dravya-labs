"""Train Dietplain with TensorFlow/Keras and export portable `.keras` artifacts."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

from app.model import build_dietplain_model

ROOT = Path(__file__).resolve().parents[1]
CONTINUOUS = ["Calories (kcal)", "Protein (g)", "Carbohydrates (g)", "Fat (g)", "Fiber (g)", "Sugars (g)", "Sodium (mg)", "Cholesterol (mg)", "Water_Intake (ml)"]
tf.keras.utils.set_random_seed(42)


def main() -> None:
    csv_path = ROOT / "daily_food_nutrition_dataset.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path, on_bad_lines="skip").dropna(subset=["Food_Item"] + CONTINUOUS).copy()
    for column in CONTINUOUS:
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0)
    scaler = MinMaxScaler()
    continuous_values = scaler.fit_transform(df[CONTINUOUS]).astype("float32")
    meal_encoder = LabelEncoder()
    meal = meal_encoder.fit_transform(df["Meal_Type"].fillna("Any")).astype("float32")
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["Food_Item"].astype(str).str.strip())
    x = np.column_stack((meal, continuous_values)).astype("float32")
    model = build_dietplain_model(x.shape[1], len(label_encoder.classes_))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    output_dir = ROOT / "model"; output_dir.mkdir(exist_ok=True)
    model.fit(x, y, validation_split=0.2, epochs=150, batch_size=128, verbose=2,
              callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=20, restore_best_weights=True),
                         tf.keras.callbacks.ModelCheckpoint(output_dir / "dietplain_model.keras", monitor="val_accuracy", mode="max", save_best_only=True)])
    metadata = {
        "num_classes": len(label_encoder.classes_), "input_dim": x.shape[1],
        "feature_columns": ["Meal_Type_Encoded"] + CONTINUOUS, "continuous_columns": CONTINUOUS,
        "meal_classes": meal_encoder.classes_.tolist(), "id_to_name": {str(i): name for i, name in enumerate(label_encoder.classes_)},
        "name_to_id": {name: int(i) for i, name in enumerate(label_encoder.classes_)},
        "scaler_params": {"min": scaler.data_min_.tolist(), "max": scaler.data_max_.tolist(), "columns": CONTINUOUS}, "framework": "tensorflow",
    }
    (output_dir / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    df.groupby("Food_Item")[CONTINUOUS].mean().reset_index().to_csv(output_dir / "food_lookup.csv", index=False)


if __name__ == "__main__":
    main()
