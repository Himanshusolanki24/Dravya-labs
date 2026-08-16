"""Compatibility entry point retained for existing automation.

The former LightGBM trainer was intentionally replaced by TensorFlow/Keras.
"""

from train_model import main


if __name__ == "__main__":
    main()
