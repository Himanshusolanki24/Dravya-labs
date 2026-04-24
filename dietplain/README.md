# Dietplain Knowledge Microservice

PyTorch-based FastAPI microservice that recommends specific food items based on precise nutritional macros and meal types.

## 🚀 Setup & Execution

### 1. Train the Knowledge Model
Open `training/dietplain_model_training.ipynb` in Google Colab. 
Run all cells. The notebook will automatically:
1. Download the latest dataset directly from Kaggle (`adilshamim8/daily-food-and-nutrition-dataset`)
2. Process 580+ food profiles
3. Train a wide 1024-layer Neural Network to a Top-K rating >80-85%
4. Spit out 3 artifacts: `dietplain_model.pth`, `model_metadata.json`, and `food_lookup.csv`

Download these 3 files and place them inside `dietplain/model/` directory.

### 2. Start the Backend API
```bash
cd dietplain
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```
Server runs on: **http://localhost:8004**

## 🛡️ API Endpoints

### `POST /predict`
Recommends food based on nutritional targets.

**Headers:**
- `X-API-Key: <your-api-key-from-env>`

**Request Body (JSON):**
```json
{
  "meal_type": "Breakfast",
  "calories": 300,
  "protein": 20,
  "carbs": 30,
  "fat": 10,
  "fiber": 5,
  "sugars": 2,
  "sodium": 150,
  "cholesterol": 50,
  "water_intake": 200,
  "top_k": 5
}
```

**Response:**
```json
{
  "meal_context": "Breakfast",
  "matches": [
    {
      "rank": 1,
      "food_name": "Oatmeal with berries",
      "confidence": 0.985,
      "nutritional_profile": {
        "calories_kcal": 280,
        "protein_g": 18,
        "carbs_g": 35,
        "fat_g": 8,
        "fiber_g": 6
      }
    }
  ]
}
```

### `GET /food/{name}`
Look up average nutritional values for a specific food.

### `GET /health`
Verify server and model status.
