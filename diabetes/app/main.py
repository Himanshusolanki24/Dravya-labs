import json
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import os
from .model import load_model, DiabetesModel
from .schemas import DiabetesInput, DiabetesOutput

# Global variables for model and scaler
model = None
scaler_params = None
device = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model and scaler
    global model, scaler_params, device
    
    # Paths (assuming files are in the parent directory or same directory)
    # Adjust paths as needed based on where you run the server from
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_path, "diabetes_model.pth")
    scaler_path = os.path.join(base_path, "scaler_params.json")
    
    print(f"Loading model from: {model_path}")
    print(f"Loading scaler from: {scaler_path}")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print("⚠️ Model or Scaler file not found. Please train the model using the notebook first.")
    else:
        try:
            model, device = load_model(model_path)
            
            with open(scaler_path, 'r') as f:
                scaler_params = json.load(f)
                
            print("✅ Model and Scaler loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down...")

app = FastAPI(title="Diabetes Prediction API", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Diabetes Prediction API is running."}

@app.post("/predict", response_model=DiabetesOutput)
def predict(input_data: DiabetesInput):
    global model, scaler_params, device
    
    if model is None or scaler_params is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
    
    # 1. Prepare input list
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
    
    # 2. Preprocess (Scaling)
    # x_scaled = (x - mean) / scale
    mean = scaler_params["mean"]
    scale = scaler_params["scale"]
    
    scaled_data = []
    for i, value in enumerate(data):
        scaled_value = (value - mean[i]) / scale[i]
        scaled_data.append(scaled_value)
        
    # 3. Convert to Tensor
    input_tensor = torch.FloatTensor([scaled_data]).to(device)
    
    # 4. Inference
    with torch.no_grad():
        output = model(input_tensor)
        probability = torch.sigmoid(output).item()
        
    is_diabetic = probability >= 0.5
    prediction = "Diabetic" if is_diabetic else "Non-Diabetic"
    
    return {
        "prediction": prediction,
        "probability": probability,
        "is_diabetic": is_diabetic
    }
