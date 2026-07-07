"""
LightGBM training script for diabetes prediction.
Replaces the PyTorch train_model.py.
"""

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import json
import os

np.random.seed(42)

csv_path = "diabetes.csv"
if not os.path.exists(csv_path):
    print(f"Dataset not found at {csv_path}.")
    exit(1)

df = pd.read_csv(csv_path)
print(f"✅ Loaded dataset: {df.shape}")

# Replace 0s with NaN and fill with median
cols_missing = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[cols_missing] = df[cols_missing].replace(0, np.nan)
df.fillna(df.median(), inplace=True)
print("✅ Imputed missing values (0s) with median.")

X = df.drop('Outcome', axis=1)
y = df['Outcome']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

train_data = lgb.Dataset(X_train_scaled, label=y_train)
val_data = lgb.Dataset(X_test_scaled, label=y_test, reference=train_data)

params = {
    'objective': 'binary',
    'metric': 'binary_logloss',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'verbose': -1,
    'is_unbalance': True,
}

print("🚀 Training LightGBM model...")
model = lgb.train(
    params,
    train_data,
    num_boost_round=200,
    valid_sets=[val_data],
)

# Evaluate
y_pred_proba = model.predict(X_test_scaled)
y_pred = (y_pred_proba >= 0.5).astype(int)
acc = accuracy_score(y_test, y_pred)
print(f"✅ Validation Accuracy: {acc * 100:.2f}%")

# Save model
model.save_model("diabetes_model.txt")
print("✅ Saved diabetes_model.txt")

# Save scaler params
scaler_params = {
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist()
}
with open("scaler_params.json", "w") as f:
    json.dump(scaler_params, f)
print("✅ Saved scaler_params.json")
