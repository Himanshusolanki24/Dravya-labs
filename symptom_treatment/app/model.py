"""TensorFlow/Keras model factory for symptom-to-treatment classification."""

import tensorflow as tf


def build_symptom_treatment_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(input_dim,), name="symptoms")
    x = inputs
    for units, dropout in ((512, 0.3), (256, 0.3), (128, 0.2), (64, 0.1)):
        x = tf.keras.layers.Dense(units, kernel_initializer="he_normal")(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.ReLU()(x)
        x = tf.keras.layers.Dropout(dropout)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="disease")(x)
    return tf.keras.Model(inputs, outputs, name="symptom_treatment")
