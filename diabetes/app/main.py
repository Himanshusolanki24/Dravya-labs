import json
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import os
from .model import load_model, predict
from .schemas import DiabetesInput, DiabetesOutput

# Global variables
_ready = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ready
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_path, "diabetes_model.txt")
    scaler_path = os.path.join(base_path, "scaler_params.json")

    print(f"Loading model from: {model_path}")
    print(f"Loading scaler from: {scaler_path}")

    if not os.path.exists(model_path):
        print("⚠️ Model file not found. Please train the model first.")
    else:
        try:
            load_model(model_path, scaler_path)
            _ready = True
            print("✅ LightGBM Model and Scaler loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading model: {e}")

    yield
    print("Shutting down...")

app = FastAPI(title="Diabetes Prediction API (LightGBM)", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Diabetes Prediction API is running (LightGBM)."}

@app.post("/predict", response_model=DiabetesOutput)
def predict_endpoint(input_data: DiabetesInput):
    if not _ready:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")

    data = [
        input_data.Pregnancies,
        input_data.Glucose,
        input_data.BloodPressure,
        input_data.SkinThickness,
        input_data.Insulin,
        input_data.BMI,
        input_data.DiabetesPedigreeFunction,
        input_data.Age
    ]

    result = predict(data)
    return result
