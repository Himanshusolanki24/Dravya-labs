"""TensorFlow dataset adapter for Hugging Face image-classification datasets."""

from typing import Optional

import numpy as np
import tensorflow as tf
from datasets import load_dataset


def load_skin_dataset(dataset_name: str, split: str = "train", max_samples: Optional[int] = None):
    """Load an HF dataset and expose image/label pairs as `tf.data.Dataset`.

    The dataset must provide `image` and `label` columns, the standard Hugging
    Face image classification contract.
    """
    dataset = load_dataset(dataset_name, split=split)
    if max_samples is not None:
        dataset = dataset.select(range(min(max_samples, len(dataset))))
    label_feature = dataset.features["label"]
    classes = list(label_feature.names) if hasattr(label_feature, "names") else sorted({str(value) for value in dataset["label"]})

    def generator():
        for row in dataset:
            image = row["image"].convert("RGB").resize((224, 224))
            yield np.asarray(image, dtype=np.float32), np.int32(row["label"])

    tf_dataset = tf.data.Dataset.from_generator(
        generator,
        output_signature=(
            tf.TensorSpec(shape=(224, 224, 3), dtype=tf.float32),
            tf.TensorSpec(shape=(), dtype=tf.int32),
        ),
    )
    return tf_dataset, classes
