"""TensorFlow/Keras model factory for Ayurvedic herb classification."""

import tensorflow as tf


def build_herb_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(input_dim,), name="herb_query")
    x = inputs
    for units, dropout in ((512, 0.3), (256, 0.2)):
        x = tf.keras.layers.Dense(units, kernel_initializer="he_normal")(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.ReLU()(x)
        x = tf.keras.layers.Dropout(dropout)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="herb")(x)
    return tf.keras.Model(inputs, outputs, name="herb_knowledge")
