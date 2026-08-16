"""TensorFlow/Keras model factory for Prakriti classification."""

import tensorflow as tf


def build_brahma_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    """Create the dense classifier used by training and serving."""
    inputs = tf.keras.Input(shape=(input_dim,), name="traits")
    x = inputs
    for units, dropout in ((512, 0.3), (256, 0.2), (128, 0.1)):
        x = tf.keras.layers.Dense(units, kernel_initializer="he_normal")(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.ReLU()(x)
        x = tf.keras.layers.Dropout(dropout)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="dosha")(x)
    return tf.keras.Model(inputs, outputs, name="brahma_prakriti")
