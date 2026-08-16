# Hugging Face Space Deployment

Each service directory is a self-contained Docker Space. Create one Docker Space per
directory, copy that directory's contents to the Space repository, add its API key as
a Space secret, and commit the TensorFlow `.keras` artifact produced by its training
script along with the existing JSON/CSV metadata.

All containers use port `7860`, load a CPU-only TensorFlow 2.16 runtime, and expose a
FastAPI application at `app.main:app`. Set `MODEL_DIR` only when the artifacts are not
in the default `model/` directory. The diabetes model lives at that service root and
does not use `MODEL_DIR`.

| Service | Train command | Required model artifact |
| --- | --- | --- |
| Brahma | `python training/train_local.py` | `model/brahma_model.keras` |
| Herbs | `python training/train_local.py` | `model/herb_model.keras` |
| Dietplain | `python training/train_local.py` | `model/dietplain_model.keras` |
| Autoimmune | `python training/train_local.py` | `model/autoimmune_model.keras` |
| Symptom treatment | `python training/train_model.py` | `model/symptom_treatment_model.keras` |
| Skin | `python training/train.py` | `model/skin_model.keras` |
| Diabetes | `python train_model.py` | `diabetes_model.keras` |

The old `.pth` and LightGBM artifacts are intentionally unsupported. Retrain before
deploying so feature metadata and Keras weights are generated as a matching pair.
