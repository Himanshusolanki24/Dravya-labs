---
title: Brahma Prakriti API
sdk: docker
app_port: 7860
---

# Brahma Prakriti API

TensorFlow/Keras FastAPI service for Ayurvedic Dosha classification.

Run `python training/train_local.py` to create `model/brahma_model.keras` and its metadata. For a Hugging Face Docker Space, keep the `Dockerfile`, `requirements.txt`, `app/`, and `model/` directory together. The service runs on port `7860`.
