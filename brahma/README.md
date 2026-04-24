# Brahma Prakriti Knowledge Microservice

PyTorch-based FastAPI microservice that determines an individual's Ayurvedic 'Dosha' (Vata, Pitta, Kapha) based on 29 categorical physical and lifestyle traits.

## 🚀 Setup & Execution

### 1. Train the Knowledge Model
Open `training/brahma_model_training.ipynb` in Google Colab. 
Run all cells. The notebook will automatically:
1. Download the latest dataset directly from Kaggle (`adityaprashantshirke/prakriti-updated`)
2. Label Encode 29 purely text-based descriptive columns
3. Train a deep 512-layer Neural Network to a Top-1 Accuracy > 90%
4. Spit out 3 artifacts: `brahma_model.pth`, `model_metadata.json`, and `dosha_lookup.csv`

Download these 3 files and place them inside the `brahma/model/` directory.
*(Note: You can alternatively run `python training/train_local.py` to do this directly on your Mac without Colab).*

### 2. Start the Backend API
```bash
cd brahma
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```
Server runs on: **http://localhost:8005**

## 🛡️ API Endpoints

### `POST /predict`
Predicts Dosha based on 29 physical traits.

**Headers:**
- `X-API-Key: <your-api-key-from-env>`

**Request Body (JSON):**
```json
{
  "Body Size": "Medium",
  "Body Weight": "Moderate - no difficulties in gaining or losing weight",
  "Height": "Average",
  "Bone Structure": "Medium bone structure",
  "Complexion": "Fair-skin sunburns easily",
  "General feel of skin": "Smooth and warm, oily T-zone",
  "Texture of Skin": "Oily",
  "Hair Color": "Black/Brown,dull",
  "Appearance of Hair": "Straight, oily",
  "Shape of face": "Long, angular, thin",
  "Eyes": "Medium-sized, penetrating, light-sensitive eyes",
  "Eyelashes": "Moderate eyelashes",
  "Blinking of Eyes": "Moderate Blinking",
  "Cheeks": "Smooth, Flat",
  "Nose": "Rounded, Large open nostrils",
  "Teeth and gums": "Medium-sized teeth, Reddish gums",
  "Lips": "Lips are soft, medium-sized",
  "Nails": "Sharp, Flexible, Pink, Lustrous",
  "Appetite": "Slow but steady",
  "Liking tastes": "Sweet / Sour / Salty",
  "Metabolism Type": "fast",
  "Climate Preference": "warm",
  "Stress Levels": "moderate",
  "Sleep Patterns": "moderate",
  "Dietary Habits": "vegan",
  "Physical Activity Level": "moderate",
  "Water Intake": "moderate",
  "Digestion Quality": "moderate",
  "Skin Sensitivity": "sensitive"
}
```

**Response:**
```json
{
  "primary_dosha": "Pitta",
  "matches": [
    {
      "rank": 1,
      "dosha": "Pitta",
      "confidence": 0.895
    },
    {
      "rank": 2,
      "dosha": "Vata+Pitta",
      "confidence": 0.082
    }
  ]
}
```

### `GET /health`
Verify server and model status.
