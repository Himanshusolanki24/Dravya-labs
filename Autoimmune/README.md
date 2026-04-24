# 🧬 Dravya Labs — Autoimmune Knowledge Microservice

Standalone FastAPI microservice for autoimmune disorder prediction using a PyTorch model trained on patient lab data, symptoms, and antibody markers.

## Project Structure

```
Autoimmune/
├── training/
│   └── autoimmune_model_training.ipynb  ← Google Colab notebook
├── model/                               ← Model artifacts (after training)
│   ├── autoimmune_model.pth
│   ├── model_metadata.json
│   └── disease_lookup.csv
├── app/
│   ├── __init__.py
│   ├── model.py         ← PyTorch architecture
│   ├── inference.py     ← Prediction engine
│   ├── schemas.py       ← Pydantic schemas
│   └── main.py          ← FastAPI application
├── Autoimmune_Disorder_10k_with_All_Disorders.csv
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

### 1. Train the Model (Google Colab)

1. Open `training/autoimmune_model_training.ipynb` in Google Colab
2. Upload `Autoimmune_Disorder_10k_with_All_Disorders.csv`
3. Run all cells
4. Download the 3 output files and place them in `model/`

### 2. Run the Microservice

```bash
cd Autoimmune
pip install -r requirements.txt
cp .env.example .env  # Edit API key if needed
python -m app.main
```

Server starts at `http://localhost:8003`

### 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict autoimmune disorder from patient data |
| GET | `/diseases/{name}` | Lookup disease details |
| GET | `/health` | Health check (no auth) |
| GET | `/docs` | Swagger UI |

### 4. Example Request

```bash
curl -X POST http://localhost:8003/predict \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-autoimmune-key-change-me" \
  -d '{
    "age": 45,
    "gender": "Female",
    "sickness_duration_months": 12,
    "hemoglobin": 11.5,
    "wbc_count": 9500,
    "esr": 35,
    "crp": 4.2,
    "ana": 1,
    "symptoms": {
      "fatigue": 1,
      "joint_pain": 1,
      "rashes": 1
    },
    "antibodies": {
      "anti_dsdna": 1,
      "anti_ro_ssa": 1
    },
    "top_k": 5
  }'
```

## Dataset

- **12,500 patients** with **100+ autoimmune disorders**
- Features: demographics, lab values, symptoms, antibody markers
- Source: `Autoimmune_Disorder_10k_with_All_Disorders.csv`

## Connect from AI Backend

```python
import httpx

response = httpx.post(
    "http://localhost:8003/predict",
    headers={"X-API-Key": "dev-autoimmune-key-change-me"},
    json={
        "age": 45,
        "gender": "Female",
        "symptoms": {"fatigue": 1, "joint_pain": 1},
        "top_k": 5
    }
)
print(response.json())
```
