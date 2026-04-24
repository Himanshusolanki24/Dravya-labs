# Dravya Labs — Symptom→Treatment Microservice (Model B)

This microservice provides Ayurvedic disease classifications and treatment protocols based on patient symptoms, doshas, and health metrics.

It is powered by a PyTorch model trained on the AyurGenixAI dataset.

## Directory Structure
```
symptom_treatment/
├── app/                  # FastAPI Application and Inference engine
│   ├── main.py           # API endpoints (Port 8006)
│   ├── inference.py      # PyTorch prediction logic
│   ├── schemas.py        # Pydantic validation
│   └── model.py          # PyTorch nn.Module architecture
│
├── training/             # Scripts to train the model
│   └── train_model.py
│
├── dataset/              # Kaggle dataset goes here (AyurGenixAI CSV)
│
├── model/                # Exported artifacts (auto-created during training)
│   ├── symptom_treatment_model.pth
│   ├── model_metadata.json
│   └── treatment_lookup.csv
│
└── download_dataset.py   # Helper instructions
```

## Setup & Training

### 1. Requirements
```bash
pip install -r requirements.txt
```

### 2. Download Dataset
Run the helper script to create the directory and get instructions:
```bash
python download_dataset.py
```
*Note: Place the CSV files from Kaggle (kagglekirti123/ayurgenixai-ayurvedic-dataset) directly into the `dataset/` directory.*

### 3. Train Model
Run the training script to process the dataset and export the PyTorch artifacts:
```bash
python training/train_model.py
```
This will populate the `model/` directory.

## Running the Microservice

Start the FastAPI server on port 8006:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8006 --reload
```

## Integrating with the Backend
The service expects requests secured via the `X-API-Key` header.
In your backend `.env` file, ensure you have:
```env
SYMPTOM_TREATMENT_MODEL_API_URL=http://localhost:8006/predict
SYMPTOM_TREATMENT_MODEL_API_KEY=<your-api-key-here>
```
It is fully integrated into `backend/agents/symptoms_agent.py`.
