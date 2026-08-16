"""TensorFlow/Keras image augmentation layers."""

import tensorflow as tf


def get_train_transforms() -> tf.keras.Sequential:
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.04),
        tf.keras.layers.RandomZoom(0.1),
    ], name="skin_augmentation")


def get_val_transforms() -> tf.keras.layers.Layer:
    return tf.keras.layers.Lambda(lambda images: images, name="identity")
