import os
import time
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import kagglehub

# ==========================================
# 1. Download Dataset
# ==========================================
print("📥 Downloading Dietplain dataset from Kaggle...")
path = kagglehub.dataset_download("adilshamim8/daily-food-and-nutrition-dataset")
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]
CSV_FILE = os.path.join(path, csv_files[0])

# Use on_bad_lines='skip' because the raw CSV has some unescaped commas
df = pd.read_csv(CSV_FILE, on_bad_lines='skip')
print(f"✅ Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")

# ==========================================
# 2. Features Configuration
# ==========================================
TARGET = 'Food_Item'
CATEGORICAL_COLS = ['Meal_Type']
DROP_COLS = ['Category']

CONTINUOUS_COLS = [
    'Calories (kcal)', 'Protein (g)', 'Carbohydrates (g)', 'Fat (g)',
    'Fiber (g)', 'Sugars (g)', 'Sodium (mg)', 'Cholesterol (mg)',
    'Water_Intake (ml)'
]

df[TARGET] = df[TARGET].astype(str).str.strip()
df = df.dropna(subset=[TARGET] + CONTINUOUS_COLS)

# ==========================================
# 3. Preprocessing
# ==========================================
for col in CONTINUOUS_COLS:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(np.float32)

scaler = MinMaxScaler()
df[CONTINUOUS_COLS] = scaler.fit_transform(df[CONTINUOUS_COLS]).astype(np.float32)

scaler_params = {
    'min': scaler.data_min_.tolist(),
    'max': scaler.data_max_.tolist(),
    'columns': CONTINUOUS_COLS
}

meal_encoder = LabelEncoder()
df['Meal_Type_Encoded'] = meal_encoder.fit_transform(df['Meal_Type'].fillna('Any'))
meal_classes = meal_encoder.classes_.tolist()
CATEGORICAL_ENCODED = ['Meal_Type_Encoded']

unique_foods = sorted(df[TARGET].unique())
name_to_id = {name: idx for idx, name in enumerate(unique_foods)}
id_to_name = {idx: name for name, idx in name_to_id.items()}
df['label'] = df[TARGET].map(name_to_id)
NUM_CLASSES = len(unique_foods)

feature_cols_ordered = CATEGORICAL_ENCODED + CONTINUOUS_COLS
X = df[feature_cols_ordered].values.copy().astype(np.float32)
y = df['label'].values.copy()
INPUT_DIM = X.shape[1]

# Train on full data for maximum retrieval accuracy
X_train, X_val, y_train, y_val = X, X, y, y

BATCH_SIZE = 128
train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train))
val_dataset = TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val))

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

# ==========================================
# 4. Model Architecture (1024-wide)
# ==========================================
class DietplainModel(nn.Module):
    def __init__(self, input_dim, num_classes):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 1024), nn.ReLU(), nn.BatchNorm1d(1024), nn.Dropout(0.2),
            nn.Linear(1024, 512), nn.ReLU(), nn.BatchNorm1d(512), nn.Dropout(0.2),
            nn.Linear(512, 256), nn.ReLU(), nn.BatchNorm1d(256), nn.Dropout(0.1),
            nn.Linear(256, 128), nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.1),
            nn.Linear(128, num_classes),
        )
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                nn.init.constant_(m.bias, 0)

    def forward(self, x):
        return self.network(x)

device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
model = DietplainModel(INPUT_DIM, NUM_CLASSES).to(device)
print(f"🖥️  Using device: {device}")

# ==========================================
# 5. Training Loop
# ==========================================
EPOCHS = 150
LEARNING_RATE = 1e-3
TARGET_ACCURACY = 0.85

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=40, gamma=0.5)

# Save directly to dietplain/model/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(OUTPUT_DIR, exist_ok=True)
best_model_path = os.path.join(OUTPUT_DIR, 'dietplain_model.pth')

best_acc = 0.0
print(f"🚀 Training started for {EPOCHS} epochs (target: {TARGET_ACCURACY*100:.0f}%)")

for epoch in range(EPOCHS):
    start = time.time()
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    for batch_X, batch_y in train_loader:
        batch_X, batch_y = batch_X.to(device), batch_y.to(device)
        optimizer.zero_grad()
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += batch_y.size(0)
        correct += (predicted == batch_y).sum().item()
    scheduler.step()
    
    acc = correct / total
    marker = ''
    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), best_model_path)
        marker = ' ✅ best'
        
    elapsed = time.time() - start
    if (epoch + 1) % 5 == 0 or acc > best_acc - 0.001:
        print(f"Epoch {epoch+1:3d}/{EPOCHS} │ Acc: {acc*100:.2f}% │ {elapsed:.1f}s{marker}")
    
    if acc >= TARGET_ACCURACY:
        print(f"\n🎯 Target {TARGET_ACCURACY*100:.0f}% reached!")
        break

# ==========================================
# 6. Save Artifacts
# ==========================================
model.load_state_dict(torch.load(best_model_path, weights_only=True))

metadata = {
    'num_classes': NUM_CLASSES,
    'input_dim': INPUT_DIM,
    'feature_columns': feature_cols_ordered,
    'continuous_columns': CONTINUOUS_COLS,
    'categorical_columns': CATEGORICAL_ENCODED,
    'meal_classes': meal_classes,
    'scaler_params': scaler_params,
    'id_to_name': {str(k): v for k, v in id_to_name.items()},
    'name_to_id': name_to_id
}
meta_path = os.path.join(OUTPUT_DIR, 'model_metadata.json')
with open(meta_path, 'w') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

food_profiles = df.groupby(TARGET)[CONTINUOUS_COLS].mean().reset_index()
lookup_path = os.path.join(OUTPUT_DIR, 'food_lookup.csv')
food_profiles.to_csv(lookup_path, index=False)

print(f"\n✅ All artifacts saved directly to {OUTPUT_DIR}/")
print("Done! 🎉")
