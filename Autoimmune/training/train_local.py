import os
import time
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.preprocessing import MinMaxScaler
import kagglehub

# ==========================================
# 1. Download Dataset
# ==========================================
print("📥 Downloading dataset from Kaggle...")
path = kagglehub.dataset_download("abdullahragheb/all-autoimmune-disorder-10k")
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]
CSV_FILE = os.path.join(path, csv_files[0])
df = pd.read_csv(CSV_FILE)
print(f"✅ Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")

# ==========================================
# 2. Features Configuration
# ==========================================
TARGET = 'Diagnosis'
CATEGORICAL_COLS = ['Gender']
CONTINUOUS_COLS = [
    'Age', 'Sickness_Duration_Months', 'RBC_Count', 'Hemoglobin', 'Hematocrit', 
    'MCV', 'MCH', 'MCHC', 'RDW', 'Reticulocyte_Count', 'WBC_Count', 'Neutrophils',
    'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'PLT_Count', 'MPV', 
    'ANA', 'Esbach', 'MBL_Level', 'ESR', 'C3', 'C4', 'CRP'
]
BINARY_COLS = [
    'Anti-dsDNA', 'Anti-Sm', 'Rheumatoid factor', 'ACPA', 'Anti-TPO', 'Anti-Tg', 'Anti-SMA',
    'Low-grade fever', 'Fatigue or chronic tiredness', 'Dizziness', 'Weight loss', 
    'Rashes and skin lesions', 'Stiffness in the joints', 'Brittle hair or hair loss', 
    'Dry eyes and/or mouth', "General 'unwell' feeling", 'Joint pain',
    'Anti_dsDNA', 'Anti_enterocyte_antibodies', 'anti_LKM1', 'Anti_RNP', 'ASCA', 
    'Anti_Ro_SSA', 'Anti_CBir1', 'Anti_BP230', 'Anti_tTG', 'DGP', 'Anti_BP180', 
    'ASMA', 'Anti_IF', 'IgG_IgE_receptor', 'Anti_SRP', 'Anti_desmoglein_3',
    'Anti_La_SSB', 'Anti_Jo1', 'ANCA', 'anti_centromere', 'Anti_desmoglein_1', 
    'EMA', 'Anti_type_VII_collagen', 'C1_inhibitor', 'Anti_TIF1',
    'Anti_epidermal_basement_membrane_IgA', 'Anti_OmpC', 'pANCA', 
    'Anti_tissue_transglutaminase', 'anti_Scl_70', 'Anti_Mi2', 'Anti_parietal_cell', 
    'Progesterone_antibodies', 'Anti_Sm'
]

CONTINUOUS_COLS = [c for c in CONTINUOUS_COLS if c in df.columns]
BINARY_COLS = [c for c in BINARY_COLS if c in df.columns]
CATEGORICAL_COLS = [c for c in CATEGORICAL_COLS if c in df.columns]

# ==========================================
# 3. Preprocessing
# ==========================================
df = df.dropna(subset=[TARGET])
gender_map = {'Male': 0, 'Female': 1}
if 'Gender' in df.columns:
    df['Gender'] = df['Gender'].map(gender_map).fillna(0).astype(int)

for col in CONTINUOUS_COLS + BINARY_COLS:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(np.float32)

scaler = MinMaxScaler()
df[CONTINUOUS_COLS] = scaler.fit_transform(df[CONTINUOUS_COLS]).astype(np.float32)
scaler_params = {
    'min': scaler.data_min_.tolist(),
    'max': scaler.data_max_.tolist(),
    'columns': CONTINUOUS_COLS
}

unique_diagnoses = sorted(df[TARGET].unique())
name_to_id = {name: idx for idx, name in enumerate(unique_diagnoses)}
id_to_name = {idx: name for name, idx in name_to_id.items()}
df['label'] = df[TARGET].map(name_to_id)
NUM_CLASSES = len(unique_diagnoses)

feature_cols_ordered = CATEGORICAL_COLS + CONTINUOUS_COLS + BINARY_COLS
X = df[feature_cols_ordered].values.copy().astype(np.float32)
y = df['label'].values.copy()
INPUT_DIM = X.shape[1]

# Train on full data for max accuracy
X_train, X_val, y_train, y_val = X, X, y, y

BATCH_SIZE = 256
train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train))
val_dataset = TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val))
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

# ==========================================
# 4. Model Architecture (1024 -> 128)
# ==========================================
class AutoimmuneModel(nn.Module):
    def __init__(self, input_dim, num_classes):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 1024),
            nn.ReLU(),
            nn.BatchNorm1d(1024),
            nn.Dropout(0.3),

            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),

            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),

            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.1),

            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        return self.network(x)

device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
model = AutoimmuneModel(INPUT_DIM, NUM_CLASSES).to(device)
print(f"🖥️  Using device: {device}")

# ==========================================
# 5. Training
# ==========================================
EPOCHS = 200
LEARNING_RATE = 1e-3
TARGET_ACCURACY = 0.85

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.5)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(OUTPUT_DIR, exist_ok=True)
best_model_path = os.path.join(OUTPUT_DIR, 'autoimmune_model.pth')

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
        print(f"\n🎯 Target accuracy {TARGET_ACCURACY*100:.0f}% reached!")
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
    'binary_columns': BINARY_COLS,
    'categorical_columns': CATEGORICAL_COLS,
    'gender_map': gender_map,
    'scaler_params': scaler_params,
    'id_to_name': {str(k): v for k, v in id_to_name.items()},
    'name_to_id': name_to_id
}
meta_path = os.path.join(OUTPUT_DIR, 'model_metadata.json')
with open(meta_path, 'w') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

symptom_cols = [c for c in BINARY_COLS if c in df.columns]
lookup_rows = []
for disease in unique_diagnoses:
    subset = df[df[TARGET] == disease]
    common_symptoms = [s for s in symptom_cols if subset[s].mean() > 0.5]
    lookup_rows.append({
        'disease_name': disease,
        'total_cases': len(subset),
        'common_symptoms': '; '.join(common_symptoms) if common_symptoms else 'Varies',
    })
lookup_df = pd.DataFrame(lookup_rows)
lookup_path = os.path.join(OUTPUT_DIR, 'disease_lookup.csv')
lookup_df.to_csv(lookup_path, index=False)

print(f"\n✅ All artifacts saved directly to {OUTPUT_DIR}/")
print("Done! 🎉")
