"""Train the skin classifier with TensorFlow/Keras on a Hugging Face dataset."""

import argparse
import json

import tensorflow as tf

from app.model_loader import get_skin_model
from training.dataset import load_skin_dataset
from training.transform import get_train_transforms
from utils.helpers import get_config_path, get_model_path


def train_model(dataset_name: str = "Nagabu/HAM10000", num_epochs: int = 10,
                batch_size: int = 32, learning_rate: float = 1e-4, max_samples: int | None = None) -> None:
    tf.keras.utils.set_random_seed(42)
    dataset, classes = load_skin_dataset(dataset_name, max_samples=max_samples)
    count = max_samples if max_samples is not None else sum(1 for _ in dataset)
    dataset, count_dataset = load_skin_dataset(dataset_name, max_samples=max_samples)
    if max_samples is None:
        count = sum(1 for _ in count_dataset)
    if count < 2:
        raise ValueError("At least two images are required for training")
    validation_size = max(1, int(count * 0.2))
    dataset = dataset.shuffle(min(count, 2048), seed=42, reshuffle_each_iteration=False)
    validation = dataset.take(validation_size).batch(batch_size).prefetch(tf.data.AUTOTUNE)
    training = dataset.skip(validation_size).batch(batch_size).prefetch(tf.data.AUTOTUNE)
    augmentation = get_train_transforms()
    model = get_skin_model(num_classes=len(classes), pretrained=True)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(training.map(lambda image, label: (augmentation(image, training=True), label)), validation_data=validation,
              epochs=num_epochs, callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", mode="max", patience=3, restore_best_weights=True),
              tf.keras.callbacks.ModelCheckpoint(get_model_path(), monitor="val_accuracy", mode="max", save_best_only=True)], verbose=2)
    get_config_path().write_text(json.dumps({"classes": classes, "class_to_idx": {name: index for index, name in enumerate(classes)},
                                             "descriptions": {name: f"Skin condition: {name}" for name in classes}, "framework": "tensorflow"}, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default="Nagabu/HAM10000")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--max-samples", type=int)
    args = parser.parse_args()
    train_model(args.dataset, args.epochs, args.batch_size, args.lr, args.max_samples)
