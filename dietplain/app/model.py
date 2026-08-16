"""TensorFlow/Keras model factory for food recommendation."""

import tensorflow as tf


def build_dietplain_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(input_dim,), name="nutrition")
    x = inputs
    for units, dropout in ((1024, 0.2), (512, 0.2), (256, 0.1), (128, 0.1)):
        x = tf.keras.layers.Dense(units, kernel_initializer="he_normal")(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.ReLU()(x)
        x = tf.keras.layers.Dropout(dropout)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="food")(x)
    return tf.keras.Model(inputs, outputs, name="dietplain")
