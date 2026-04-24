# Dravya Labs Skin AI

Skin disease detection using **EfficientNet-B0** (PyTorch) + **FastAPI** inference server.

## Quick Start

### 1. Setup

```bash
cd skin
pip install -r requirements.txt
```

Create `.env.local` with your HuggingFace token:
```
HF_TOKEN=hf_your_token_here
```

### 2. Train the Model

**Option A — Jupyter Notebook** (recommended for local GPU):
```
Open Dravya_Labs_Skin_AI_Training_Local.ipynb in VS Code / Jupyter
```

**Option B — CLI**:
```bash
python -m training.train --epochs 10 --batch_size 32
```

**Optional — Pre-download images for faster training:**
```bash
python scripts/download_dataset.py
```

Training outputs:
- `model/skin_model.pth` — trained weights
- `model/model_config.json` — class labels & descriptions

### 3. Run Inference Server

```bash
uvicorn app.main:app --reload
```

**Endpoints:**
| Method | Path       | Description                     |
|--------|------------|---------------------------------|
| GET    | `/`        | Server info                     |
| GET    | `/health`  | Model status                    |
| POST   | `/predict` | Upload image, get prediction    |
| GET    | `/docs`    | Interactive API docs (Swagger)  |

**Example:**
```bash
curl -X POST -F "file=@skin_image.jpg" http://localhost:8000/predict
```

```json
{
  "predictions": [
    {"disease": "melanoma", "confidence": 0.92, "description": "Skin condition: melanoma"}
  ],
  "disclaimer": "This AI system is for educational purposes only and not a medical diagnosis."
}
```

## Dataset

Default: **Nagabu/HAM10000** (public, binary classification).

To switch datasets, change `DATASET_NAME` in the notebook or pass `--dataset` to the CLI:
```bash
python -m training.train --dataset "redlessone/Derm1M"
```

## Project Structure

```
skin/
├── app/                    # FastAPI server
│   ├── main.py             # App entrypoint
│   ├── routes.py           # API endpoints (/predict, /health)
│   ├── inference.py        # SkinPredictor class
│   ├── model_loader.py     # EfficientNet-B0 loading
│   └── schemas.py          # Pydantic models
├── training/               # Model training
│   ├── train.py            # Training script (CLI)
│   ├── dataset.py          # HFSkinDataset (HuggingFace loader)
│   ├── transform.py        # Image transforms
│   └── evaluate.py         # Metrics (accuracy, F1, etc.)
├── model/                  # Trained artifacts
│   ├── skin_model.pth      # Model weights (generated)
│   └── model_config.json   # Class config (generated)
├── scripts/
│   └── download_dataset.py # Pre-download images to disk
├── utils/
│   ├── helpers.py          # Paths, env loading
│   └── logger.py           # Logging setup
├── tests/
│   └── test_api.py         # API tests
├── Dravya_Labs_Skin_AI_Training_Local.ipynb  # Training notebook
├── requirements.txt
├── .env.local              # HF_TOKEN (not committed)
└── .gitignore
```

## Disclaimer

**Not a Medical Device.** This software is for educational and research purposes only.
