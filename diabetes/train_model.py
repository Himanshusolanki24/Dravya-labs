"""Train and export the diabetes classifier as a TensorFlow/Keras artifact."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
tf.keras.utils.set_random_seed(42)


def build_model(input_dim: int = 8) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(input_dim,), name="clinical_values")
    x = inputs
    for units, dropout in ((128, 0.3), (64, 0.3), (16, 0.0)):
        x = tf.keras.layers.Dense(units, activation="relu", kernel_initializer="he_normal")(x)
        x = tf.keras.layers.BatchNormalization()(x)
        if dropout:
            x = tf.keras.layers.Dropout(dropout)(x)
    outputs = tf.keras.layers.Dense(1, activation="sigmoid", name="diabetes_risk")(x)
    return tf.keras.Model(inputs, outputs, name="diabetes_classifier")


def main() -> None:
    data_path = ROOT / "diabetes.csv"
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")
    df = pd.read_csv(data_path)
    missing_value_columns = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    df[missing_value_columns] = df[missing_value_columns].replace(0, np.nan)
    df = df.fillna(df.median(numeric_only=True))
    features = df.drop(columns="Outcome").astype("float32")
    labels = df["Outcome"].astype("float32")
    x_train, x_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    scaler = StandardScaler()
    x_train = scaler.fit_transform(x_train).astype("float32")
    x_test = scaler.transform(x_test).astype("float32")
    model = build_model(x_train.shape[1])
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=tf.keras.losses.BinaryCrossentropy(),
        metrics=[tf.keras.metrics.BinaryAccuracy(name="accuracy"), tf.keras.metrics.AUC(name="auc")],
    )
    checkpoint = ROOT / "diabetes_model.keras"
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_auc", mode="max", patience=30, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(checkpoint, monitor="val_auc", mode="max", save_best_only=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", patience=12, factor=0.5),
    ]
    class_weight = {0: 1.0, 1: float((labels == 0).sum() / max((labels == 1).sum(), 1))}
    model.fit(x_train, y_train, validation_data=(x_test, y_test), epochs=400, batch_size=32,
              callbacks=callbacks, class_weight=class_weight, verbose=2)
    with open(ROOT / "scaler_params.json", "w", encoding="utf-8") as file:
        json.dump({"mean": scaler.mean_.tolist(), "scale": scaler.scale_.tolist()}, file, indent=2)
    metrics = model.evaluate(x_test, y_test, verbose=0, return_dict=True)
    print({key: round(float(value), 4) for key, value in metrics.items()})


if __name__ == "__main__":
    main()
