"""
Training script for the Symptom→Treatment PyTorch model.
Processes the AyurGenixAI dataset and exports inference artifacts.
"""

import os
import json
import logging
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

# Use absolute import assuming running from project root or modified PYTHONPATH
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.model import SymptomTreatmentModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class AyurvedicDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.FloatTensor(X)
        self.y = torch.LongTensor(y)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def train():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(base_dir, "..")
    data_dir = os.path.join(project_root, "dataset")
    model_export_dir = os.path.join(project_root, "model")
    
    os.makedirs(model_export_dir, exist_ok=True)

    # 1. Find the CSV file
    csv_file = None
    if os.path.exists(data_dir):
        for f in os.listdir(data_dir):
            if f.endswith('.csv'):
                csv_file = os.path.join(data_dir, f)
                break
    
    if not csv_file:
        logger.error(f"❌ No CSV dataset found in {data_dir}. Run download_dataset.py or place manually.")
        return

    logger.info(f"Loading dataset from: {csv_file}")
    
    try:
        # Load the dataset
        df = pd.read_csv(csv_file)
        logger.info(f"Loaded {len(df)} rows and {len(df.columns)} columns.")
        
        # NOTE: Since the exact schema of AyurGenixAI dataset varies slightly between versions,
        # we dynamically discover columns. We assume there's a target 'Disease' or 'Diagnosis' column.
        
        target_col = None
        for col in ['Disease', 'Diagnosis', 'Condition', 'Label', 'Target']:
            if col in df.columns:
                target_col = col
                break
                
        if not target_col:
            # Fallback for kaggle datasets which sometimes use variations
            possible_targets = [c for c in df.columns if 'disease' in c.lower() or 'diagnos' in c.lower()]
            if possible_targets:
                target_col = possible_targets[0]
            else:
                target_col = df.columns[-1] # Usually the last column
                
        logger.info(f"Selected target column: {target_col}")

        # Basic preprocessing
        df = df.fillna(0) # Simple imputation for missing values
        
        # Extract Treatment mapping before dropping columns
        # Looking for columns related to treatment, herbs, diet etc
        treatment_cols = [c for c in df.columns if any(kw in c.lower() for kw in 
                        ['treatment', 'herb', 'diet', 'lifestyle', 'yoga', 'panchakarma', 'dosha'])]
        
        # Build the treatment lookup table
        lookup_df = df[[target_col] + treatment_cols].drop_duplicates(subset=[target_col])
        
        # Rename standard columns for inference engine
        rename_map = {target_col: "disease_name"}
        
        for col in treatment_cols:
            c_low = col.lower()
            if 'herb' in c_low or 'medicine' in c_low: rename_map[col] = "herbs"
            elif 'diet' in c_low or 'ahara' in c_low: rename_map[col] = "dietary_advice"
            elif 'lifestyle' in c_low or 'vihara' in c_low: rename_map[col] = "lifestyle_changes"
            elif 'dosha' in c_low: rename_map[col] = "dosha_involvement"
            elif 'yoga' in c_low or 'pranayama' in c_low: rename_map[col] = "yoga_pranayama"
            elif 'panchakarma' in c_low: rename_map[col] = "panchakarma"
            elif 'ayurvedic' in c_low and 'name' in c_low: rename_map[col] = "ayurvedic_name"
            
        lookup_df = lookup_df.rename(columns=rename_map)
        
        # Count frequencies
        freq = df[target_col].value_counts().reset_index()
        freq.columns = ["disease_name", "total_cases"]
        
        lookup_df = pd.merge(lookup_df, freq, on="disease_name", how="left")
        
        # Save lookup
        lookup_path = os.path.join(model_export_dir, "treatment_lookup.csv")
        lookup_df.to_csv(lookup_path, index=False)
        logger.info(f"✅ Saved treatment mappings to {lookup_path}")

        # Separate Features & Target
        X_df = df.drop(columns=[target_col] + treatment_cols)
        
        # Process categorical features and identify continuous vs categorical
        continuous_cols = []
        binary_cols = []
        categorical_cols = []
        symptom_cols = []
        
        # Encode target
        le = LabelEncoder()
        y = le.fit_transform(df[target_col])
        
        # Extract target mapping
        id_to_name = {int(i): str(name) for i, name in enumerate(le.classes_)}
        name_to_id = {str(name): int(i) for i, name in enumerate(le.classes_)}
        
        num_classes = len(le.classes_)
        logger.info(f"Identifying {num_classes} unique diseases.")

        # Process X
        X_processed = pd.DataFrame()
        
        for col in X_df.columns:
            if pd.api.types.is_numeric_dtype(X_df[col]):
                # If binary
                if set(X_df[col].unique()).issubset({0, 1}):
                    binary_cols.append(col)
                    if any(kw in col.lower() for kw in ['pain', 'fever', 'ache', 'symptom']):
                        symptom_cols.append(col)
                    X_processed[col] = X_df[col]
                else:
                    continuous_cols.append(col)
                    X_processed[col] = X_df[col]
            else:
                categorical_cols.append(col)
                # Simple label encoding for other categoricals
                c_le = LabelEncoder()
                X_processed[col] = c_le.fit_transform(X_df[col].astype(str))
                
        # Scale continuous features
        scaler_min, scaler_max = [], []
        if continuous_cols:
            scaler = MinMaxScaler()
            X_processed[continuous_cols] = scaler.fit_transform(X_processed[continuous_cols])
            scaler_min = scaler.data_min_.tolist()
            scaler_max = scaler.data_max_.tolist()

        feature_columns = list(X_processed.columns)
        input_dim = len(feature_columns)
        
        logger.info(f"Processed {input_dim} features: {len(continuous_cols)} continuous, {len(binary_cols)} binary, {len(categorical_cols)} categorical.")

        # Handle class instances with low samples by wrapping the split
        X_values = X_processed.values
        try:
            X_train, X_test, y_train, y_test = train_test_split(X_values, y, test_size=0.2, random_state=42, stratify=y)
        except ValueError:
            logger.warning("Disabling stratify=y due to class frequency < 2")
            X_train, X_test, y_train, y_test = train_test_split(X_values, y, test_size=0.2, random_state=42)
        
        train_dataset = AyurvedicDataset(X_train, y_train)
        test_dataset = AyurvedicDataset(X_test, y_test)
        
        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

        # 4. Initialize Model
        model = SymptomTreatmentModel(input_dim=input_dim, num_classes=num_classes)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        # 5. Training Loop
        epochs = 20
        logger.info(f"Starting training for {epochs} epochs...")
        
        best_acc = 0.0
        
        for epoch in range(epochs):
            model.train()
            running_loss = 0.0
            
            for inputs, targets in train_loader:
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()
                
            # Evaluation
            model.eval()
            correct = 0
            total = 0
            with torch.no_grad():
                for inputs, targets in test_loader:
                    outputs = model(inputs)
                    _, predicted = torch.max(outputs.data, 1)
                    total += targets.size(0)
                    correct += (predicted == targets).sum().item()
            
            acc = 100 * correct / (total if total > 0 else 1)
            logger.info(f"Epoch {epoch+1}/{epochs} | Loss: {running_loss/len(train_loader):.4f} | Val Acc: {acc:.2f}%")
            
            if acc > best_acc:
                best_acc = acc
                # Save best weights
                torch.save(model.state_dict(), os.path.join(model_export_dir, "symptom_treatment_model.pth"))

        logger.info(f"🎉 Training complete! Best validation accuracy: {best_acc:.2f}%")

        # 6. Save Metadata
        metadata = {
            "num_classes": num_classes,
            "input_dim": input_dim,
            "feature_columns": feature_columns,
            "continuous_columns": continuous_cols,
            "binary_columns": binary_cols,
            "categorical_columns": categorical_cols,
            "symptom_columns": symptom_cols,
            "scaler_params": {
                "min": scaler_min,
                "max": scaler_max
            },
            "id_to_name": id_to_name,
            "name_to_id": name_to_id
        }
        
        meta_path = os.path.join(model_export_dir, "model_metadata.json")
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2)
            
        logger.info(f"✅ Saved metadata to {meta_path}")
        
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)


if __name__ == "__main__":
    train()
