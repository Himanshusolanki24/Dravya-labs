import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from PIL import Image
import io

client = TestClient(app)

@pytest.fixture
def mock_image():
    # Create a dummy image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    return img_byte_arr

@patch("app.routes.predictor")
def test_predict_endpoint(mock_predictor, mock_image):
    # Mock the predictor response
    mock_predictor.predict.return_value = [
        {"disease": "Acne", "confidence": 0.95, "description": "Skin condition..."}
    ]
    
    files = {"file": ("test.jpg", mock_image, "image/jpeg")}
    response = client.post("/predict", files=files)
    
    assert response.status_code == 200
    json_response = response.json()
    
    assert "predictions" in json_response
    assert len(json_response["predictions"]) == 1
    assert json_response["predictions"][0]["disease"] == "Acne"
    assert "disclaimer" in json_response
    
def test_predict_invalid_file():
    files = {"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")}
    response = client.post("/predict", files=files)
    
    assert response.status_code == 400
