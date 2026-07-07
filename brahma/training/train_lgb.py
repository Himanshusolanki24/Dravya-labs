import os
import json
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.preprocessing import LabelEncoder
import kagglehub

print("📥 Downloading Brahma Prakriti dataset from Kaggle...")
path = kagglehub.dataset_download("adityaprashantshirke/prakriti-updated")
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]
CSV_FILE = os.path.join(path, csv_files[0])

df = pd.read_csv(CSV_FILE)
df.columns = df.columns.str.strip()

TARGET = 'Dosha'
df = df.dropna(subset=[TARGET])
df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
FEATURES = [c for c in df.columns if c != TARGET]

feature_classes = {}
for col in FEATURES:
    df[col] = df[col].astype(str).str.strip().str.lower()
    encoder = LabelEncoder()
    df[f'{col}_Encoded'] = encoder.fit_transform(df[col])
    feature_classes[col] = encoder.classes_.tolist()

ENCODED_FEATURES = [f'{col}_Encoded' for col in FEATURES]

unique_doshas = sorted(df[TARGET].unique())
name_to_id = {name: idx for idx, name in enumerate(unique_doshas)}
id_to_name = {idx: name for name, idx in name_to_id.items()}
df['label'] = df[TARGET].map(name_to_id)
NUM_CLASSES = len(unique_doshas)

X = df[ENCODED_FEATURES]
y = df['label']

train_data = lgb.Dataset(X, label=y, feature_name=ENCODED_FEATURES, categorical_feature=ENCODED_FEATURES)

params = {
    'objective': 'multiclass',
    'num_class': NUM_CLASSES,
    'metric': 'multi_error',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'verbose': -1
}

print("🚀 Training LightGBM model...")
model = lgb.train(params, train_data, num_boost_round=100)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(OUTPUT_DIR, exist_ok=True)
best_model_path = os.path.join(OUTPUT_DIR, 'brahma_model.txt')

model.save_model(best_model_path)

metadata = {
    'num_classes': NUM_CLASSES,
    'input_dim': len(FEATURES),
    'features': FEATURES,
    'feature_classes': feature_classes,
    'id_to_name': {str(k): v for k, v in id_to_name.items()},
    'name_to_id': name_to_id,
}
meta_path = os.path.join(OUTPUT_DIR, 'model_metadata.json')
with open(meta_path, 'w') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"✅ LightGBM model saved to {best_model_path}")
