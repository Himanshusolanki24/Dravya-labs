import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from torch.utils.data import DataLoader, TensorDataset
import json
import os

# Set random seed for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# 1. Load Data
# Assuming diabetes.csv is in the current directory or downloaded
csv_path = "diabetes.csv"
if not os.path.exists(csv_path):
    print(f"Dataset not found at {csv_path}. Please ensure diabetes.csv is present.")
    exit(1)

df = pd.read_csv(csv_path)
print(f"✅ Loaded dataset: {df.shape}")

# 2. Preprocessing
# Replace 0s with NaN and then fill with median
cols_missing = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[cols_missing] = df[cols_missing].replace(0, np.nan)
df.fillna(df.median(), inplace=True)
print("✅ Imputed missing values (0s) with median.")

# Split Data
X = df.drop('Outcome', axis=1)
y = df['Outcome']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale Data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Convert to PyTorch Tensors
X_train = torch.FloatTensor(X_train_scaled)
y_train = torch.FloatTensor(y_train.values).unsqueeze(1)
X_test = torch.FloatTensor(X_test_scaled)
y_test = torch.FloatTensor(y_test.values).unsqueeze(1)

dataset = TensorDataset(X_train, y_train)
train_loader = DataLoader(dataset, batch_size=32, shuffle=True)

# 3. Define Model
class DiabetesModel(nn.Module):
    def __init__(self, input_dim=8):
        super(DiabetesModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.bn1 = nn.BatchNorm1d(128)
        self.fc2 = nn.Linear(128, 64)
        self.bn2 = nn.BatchNorm1d(64)
        self.fc3 = nn.Linear(64, 16)
        self.bn3 = nn.BatchNorm1d(16)
        self.fc4 = nn.Linear(16, 1)
        self.dropout = nn.Dropout(p=0.3)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)
        x = self.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = self.relu(self.bn3(self.fc3(x)))
        x = self.fc4(x)
        return x

model = DiabetesModel()

# 4. Train Model
# Weighted Loss for Class Imbalance
pos_weight = torch.tensor([1.87]) # Roughly correct for Pima (~500/268)
criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=15)

epochs = 400
best_acc = 0.0

print("🚀 Starting training...")
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    for inputs, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
    
    avg_loss = running_loss / len(train_loader)
    
    # Validation
    model.eval()
    with torch.no_grad():
        y_logits = model(X_test)
        y_probs = torch.sigmoid(y_logits)
        y_pred_cls = y_probs.round()
        acc = (y_pred_cls.eq(y_test).sum() / float(y_test.shape[0])).item()
        
    scheduler.step(avg_loss)
    
    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), 'diabetes_model.pth')
    
    if (epoch+1) % 50 == 0:
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {avg_loss:.4f}, Val Acc: {acc:.4f}')

print(f"✅ Training complete. Best Validation Accuracy: {best_acc*100:.2f}%")

# 5. Save Scaler Params
scaler_params = {
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist()
}

with open("scaler_params.json", "w") as f:
    json.dump(scaler_params, f)
print("✅ Saved scaler_params.json")
print("✅ Saved diabetes_model.pth (Best checkpoint)")
