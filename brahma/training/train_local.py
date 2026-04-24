import os
import time
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.preprocessing import LabelEncoder
import kagglehub

# ==========================================
# 1. Download Dataset
# ==========================================
print("📥 Downloading Brahma Prakriti dataset from Kaggle...")
path = kagglehub.dataset_download("adityaprashantshirke/prakriti-updated")
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]
CSV_FILE = os.path.join(path, csv_files[0])

df = pd.read_csv(CSV_FILE)
df.columns = df.columns.str.strip()

print(f"✅ Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")

# ==========================================
# 2. Features Configuration
# ==========================================
TARGET = 'Dosha'
df = df.dropna(subset=[TARGET])
df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
FEATURES = [c for c in df.columns if c != TARGET]

# ==========================================
# 3. Text Preprocessing via 29 LabelEncoders
# ==========================================
feature_classes = {}
for col in FEATURES:
    df[col] = df[col].astype(str).str.strip().str.lower() # case-insensitive matches
    encoder = LabelEncoder()
    df[f'{col}_Encoded'] = encoder.fit_transform(df[col])
    feature_classes[col] = encoder.classes_.tolist()

ENCODED_FEATURES = [f'{col}_Encoded' for col in FEATURES]
print(f"✅ Mapped {len(ENCODED_FEATURES)} categorical features.")

unique_doshas = sorted(df[TARGET].unique())
name_to_id = {name: idx for idx, name in enumerate(unique_doshas)}
id_to_name = {idx: name for name, idx in name_to_id.items()}
df['label'] = df[TARGET].map(name_to_id)
NUM_CLASSES = len(unique_doshas)

X = df[ENCODED_FEATURES].values.astype(np.float32)
y = df['label'].values
INPUT_DIM = X.shape[1]

X_train, X_val, y_train, y_val = X, X, y, y

BATCH_SIZE = 64
train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train))
val_dataset = TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val))

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

# ==========================================
# 4. Neural Network (512 Deep)
# ==========================================
class BrahmaModel(nn.Module):
    def __init__(self, input_dim, num_classes):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 512), nn.ReLU(), nn.BatchNorm1d(512), nn.Dropout(0.3),
            nn.Linear(512, 256), nn.ReLU(), nn.BatchNorm1d(256), nn.Dropout(0.2),
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
model = BrahmaModel(INPUT_DIM, NUM_CLASSES).to(device)
print(f"🖥️  Using device: {device}")

# ==========================================
# 5. Training Loop
# ==========================================
EPOCHS = 200
LEARNING_RATE = 1e-3
TARGET_ACCURACY = 0.85

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=20, T_mult=2)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(OUTPUT_DIR, exist_ok=True)
best_model_path = os.path.join(OUTPUT_DIR, 'brahma_model.pth')

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
    'features': FEATURES,
    'feature_classes': feature_classes,
    'id_to_name': {str(k): v for k, v in id_to_name.items()},
    'name_to_id': name_to_id,
    'accuracy': round(best_acc * 100, 2)
}
meta_path = os.path.join(OUTPUT_DIR, 'model_metadata.json')
with open(meta_path, 'w') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

lookup_rows = []
for dosha in unique_doshas:
    subset = df[df[TARGET] == dosha]
    row = {'Dosha': dosha, 'Patient_Count': len(subset)}
    for col in FEATURES:
        # Save the single most common string variant for this dosha profile
        if len(subset) > 0:
            row[col] = subset[col].mode().iloc[0]
        else:
            row[col] = 'Unknown'
    lookup_rows.append(row)

lookup_path = os.path.join(OUTPUT_DIR, 'dosha_lookup.csv')
pd.DataFrame(lookup_rows).to_csv(lookup_path, index=False)

print(f"\n✅ All artifacts saved directly to {OUTPUT_DIR}/")
print("Done! 🎉")
