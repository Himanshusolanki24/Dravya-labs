"""
🌿 Dravya Labs — Ayurvedic Herb Model Training (Local)
=======================================================
Trains a PyTorch classification model on ayurvedic_herbs.csv
(Amidha Ayurveda Herb Database — 700+ herbs with Rasa, Guna,
Virya, Vipaka, Prabhava, and Dosha effects).

Outputs: herbs/model/herb_model.pth, model_metadata.json, herb_lookup.csv
"""

import os
import sys
import time
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler

# ─── Paths ────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HERBS_DIR = os.path.dirname(SCRIPT_DIR)
CSV_FILE = os.path.join(HERBS_DIR, "ayurvedic_herbs.csv")
OUTPUT_DIR = os.path.join(HERBS_DIR, "model")

# ─── Config ───────────────────────────────────────────────
# Ayurvedic text features for TF-IDF vectorization
TEXT_COLUMNS = [
    "preview", "rasa", "guna", "virya", "vipaka",
    "prabhava", "therapeutic_uses", "category",
    "contraindications", "pacify_dosha", "aggravate_dosha",
]

# One-hot encoded dosha features (numeric)
DOSHA_COLUMNS = [
    "pacify_vata", "pacify_pitta", "pacify_kapha",
    "aggravate_vata", "aggravate_pitta", "aggravate_kapha",
]

# Extra numeric: tridosha flag
NUMERIC_COLUMNS = DOSHA_COLUMNS + ["tridosha_flag"]

ID_COLUMN = "name"
HINDI_COLUMN = "hindi_name"

TFIDF_MAX_FEATURES = 3000  # Smaller vocab for ~700 herbs (vs 5000 for 7K plants)
BATCH_SIZE = 64             # Smaller batches for smaller dataset
EPOCHS = 200                # More epochs since the dataset is smaller
LEARNING_RATE = 1e-3
TARGET_ACCURACY = 0.95      # High target — use eval-mode accuracy


# ─── Model ────────────────────────────────────────────────
class HerbKnowledgeModel(nn.Module):
    """
    Ayurvedic Herb classification model.
    Input:  TF-IDF text features + dosha one-hot features
    Output: logits over all herb classes (~700)
    """
    def __init__(self, input_dim: int, num_classes: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.network(x)


def main():
    print("=" * 60)
    print("🌿 Dravya Labs — Ayurvedic Herb Model Training")
    print("   Dataset: Amidha Ayurveda Herb Database (700+ herbs)")
    print("=" * 60)

    # ─── 1. Check CSV ─────────────────────────────────────
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV not found: {CSV_FILE}")
        print(f"   Run first: python scripts/download_ayurvedic_data.py")
        sys.exit(1)

    file_size = os.path.getsize(CSV_FILE) / 1024
    print(f"\n📁 CSV: {CSV_FILE} ({file_size:.1f} KB)")

    # ─── 2. Load & Clean ──────────────────────────────────
    print("\n─── Loading & Cleaning Data ───")
    df = pd.read_csv(CSV_FILE, encoding="utf-8", low_memory=False)
    print(f"   Raw: {len(df)} rows, {len(df.columns)} columns")

    df = df.dropna(subset=[ID_COLUMN])
    df = df[df[ID_COLUMN].str.strip() != ""]

    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str)

    # Convert tridosha boolean to int
    if "tridosha" in df.columns:
        df["tridosha_flag"] = df["tridosha"].astype(str).str.lower().map(
            {"true": 1, "1": 1, "false": 0, "0": 0}
        ).fillna(0).astype(int)
    else:
        df["tridosha_flag"] = 0

    for col in DOSHA_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
        else:
            df[col] = 0

    if HINDI_COLUMN in df.columns:
        df[HINDI_COLUMN] = df[HINDI_COLUMN].fillna("")

    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].str.replace(r"\s+", " ", regex=True).str.strip()

    before = len(df)
    df = df.drop_duplicates(subset=[ID_COLUMN], keep="first").reset_index(drop=True)
    print(f"   After dedup: {len(df)} (removed {before - len(df)})")
    print(f"   ✅ Clean dataset: {len(df)} unique Ayurvedic herbs")

    # ─── 3. Feature Engineering ───────────────────────────
    print("\n─── Feature Engineering ───")
    parts = [df[col] for col in TEXT_COLUMNS if col in df.columns]
    combined = parts[0]
    for p in parts[1:]:
        combined = combined + " " + p
    df["combined_text"] = combined.str.replace(r"\s+", " ", regex=True).str.strip()

    tfidf = TfidfVectorizer(
        max_features=TFIDF_MAX_FEATURES,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,       # Lower min_df since we have fewer docs
        max_df=0.95,
        sublinear_tf=True,
    )
    tfidf_matrix = tfidf.fit_transform(df["combined_text"]).toarray()
    print(f"   TF-IDF: {tfidf_matrix.shape}")

    # Numeric features (dosha one-hot + tridosha)
    numeric_cols_present = [c for c in NUMERIC_COLUMNS if c in df.columns]
    numeric_data = df[numeric_cols_present].values.astype(np.float32)
    # No scaling needed — already 0/1
    print(f"   Dosha features: {numeric_data.shape}")

    X = np.hstack([tfidf_matrix, numeric_data]).astype(np.float32)
    INPUT_DIM = X.shape[1]
    print(f"   Feature matrix: {X.shape} (input_dim={INPUT_DIM})")

    # ─── 4. Label Encoding ────────────────────────────────
    unique_names = sorted(df[ID_COLUMN].unique())
    name_to_id = {name: idx for idx, name in enumerate(unique_names)}
    id_to_name = {idx: name for name, idx in name_to_id.items()}
    y = df[ID_COLUMN].map(name_to_id).values
    NUM_CLASSES = len(unique_names)
    print(f"   Classes: {NUM_CLASSES}")

    # ─── 5. DataLoader ────────────────────────────────────
    dataset = TensorDataset(torch.FloatTensor(X), torch.LongTensor(y))
    train_loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    # ─── 6. Model ─────────────────────────────────────────
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"\n🖥️  Device: {device}")

    model = HerbKnowledgeModel(INPUT_DIM, NUM_CLASSES).to(device)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"📊 Parameters: {total_params:,}")
    print(f"   Architecture: {INPUT_DIM} → 512 → 256 → {NUM_CLASSES}")

    # ─── 7. Training ──────────────────────────────────────
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=20, T_mult=2)

    best_acc = 0.0
    best_model_path = os.path.join(OUTPUT_DIR, "herb_model.pth")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"\n🚀 Training for up to {EPOCHS} epochs (target: {TARGET_ACCURACY*100:.0f}%)")
    print("=" * 70)

    eval_dataset = DataLoader(
        TensorDataset(torch.FloatTensor(X), torch.LongTensor(y)),
        batch_size=512, shuffle=False
    )

    for epoch in range(EPOCHS):
        start = time.time()
        model.train()
        total_loss = 0.0
        total_batches = 0

        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            total_batches += 1

        scheduler.step()
        avg_loss = total_loss / total_batches

        # Evaluate in eval mode (dropout off) for accurate accuracy
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch_X, batch_y in eval_dataset:
                batch_X, batch_y = batch_X.to(device), batch_y.to(device)
                outputs = model(batch_X)
                _, predicted = torch.max(outputs, 1)
                total += batch_y.size(0)
                correct += (predicted == batch_y).sum().item()
        acc = correct / total
        elapsed = time.time() - start

        marker = ""
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), best_model_path)
            marker = " ✅ best"

        if (epoch + 1) % 5 == 0 or marker:
            print(
                f"Epoch {epoch+1:3d}/{EPOCHS} │ "
                f"Loss: {avg_loss:.4f} │ "
                f"Eval Accuracy: {acc*100:.2f}% │ "
                f"{elapsed:.1f}s{marker}"
            )

        if acc >= TARGET_ACCURACY:
            print(f"\n🎯 Target accuracy {TARGET_ACCURACY*100:.0f}% reached at epoch {epoch+1}!")
            break

    print(f"\n✅ Training complete! Best accuracy: {best_acc*100:.2f}%")

    # ─── 8. Accuracy Report ───────────────────────────────
    print("\n─── Model Accuracy Report ───")
    model.load_state_dict(torch.load(best_model_path, weights_only=True))
    model.eval()
    model.to(device)

    correct_top1 = correct_top5 = correct_top10 = total = 0
    eval_loader = DataLoader(dataset, batch_size=512, shuffle=False)

    with torch.no_grad():
        for batch_X, batch_y in eval_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            outputs = model(batch_X)

            _, pred1 = torch.max(outputs, 1)
            correct_top1 += (pred1 == batch_y).sum().item()

            _, pred5 = torch.topk(outputs, min(5, NUM_CLASSES), dim=1)
            for i in range(batch_y.size(0)):
                if batch_y[i] in pred5[i]:
                    correct_top5 += 1

            _, pred10 = torch.topk(outputs, min(10, NUM_CLASSES), dim=1)
            for i in range(batch_y.size(0)):
                if batch_y[i] in pred10[i]:
                    correct_top10 += 1

            total += batch_y.size(0)

    acc_top1 = correct_top1 / total * 100
    acc_top5 = correct_top5 / total * 100
    acc_top10 = correct_top10 / total * 100

    print(f"   Top-1  Accuracy: {acc_top1:.2f}%")
    print(f"   Top-5  Accuracy: {acc_top5:.2f}%")
    print(f"   Top-10 Accuracy: {acc_top10:.2f}%")

    # ─── 9. Save Metadata ────────────────────────────────
    metadata = {
        "num_classes": NUM_CLASSES,
        "input_dim": INPUT_DIM,
        "tfidf_max_features": TFIDF_MAX_FEATURES,
        "tfidf_vocabulary": {k: int(v) for k, v in tfidf.vocabulary_.items()},
        "numeric_columns": numeric_cols_present,
        "text_columns": TEXT_COLUMNS,
        "dosha_columns": DOSHA_COLUMNS,
        "id_to_name": {str(k): v for k, v in id_to_name.items()},
        "name_to_id": name_to_id,
        "dataset": "Amidha Ayurveda Herb Database (700+ herbs)",
        "training_config": {
            "epochs_run": epoch + 1,
            "best_accuracy": round(best_acc * 100, 2),
            "batch_size": BATCH_SIZE,
            "learning_rate": LEARNING_RATE,
        },
        "accuracy": {
            "top1": round(acc_top1, 2),
            "top5": round(acc_top5, 2),
            "top10": round(acc_top10, 2),
        },
    }

    meta_path = os.path.join(OUTPUT_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"✅ Metadata saved: {meta_path}")

    # ─── 10. Save Lookup Table ────────────────────────────
    lookup_cols = [
        ID_COLUMN, "latin_name", HINDI_COLUMN,
        "preview", "rasa", "guna", "virya", "vipaka",
        "prabhava", "pacify_dosha", "aggravate_dosha",
        "tridosha", "category", "therapeutic_uses",
        "contraindications", "source_url",
    ]
    lookup_cols = [c for c in lookup_cols if c in df.columns]

    lookup_path = os.path.join(OUTPUT_DIR, "herb_lookup.csv")
    df[lookup_cols].to_csv(lookup_path, index=False, encoding="utf-8")
    print(f"✅ Lookup saved: {lookup_path}")

    # ─── 11. Quick Test ───────────────────────────────────
    print("\n─── Quick Prediction Test ───")
    model.to("cpu")
    model.eval()

    test_queries = [
        "digestive stomach pain acidity Pitta",
        "stress anxiety Vata nervine adaptogen Medhya",
        "cough cold respiratory Kapha Kasahara",
        "skin disease Kushtaghna Raktashodhak",
        "Ushna virya Katu rasa deepana",
    ]

    for query in test_queries:
        tfidf_feat = tfidf.transform([query]).toarray()
        # Add dummy dosha features (zeros)
        numeric_pad = np.zeros((1, len(numeric_cols_present)), dtype=np.float32)
        features = np.hstack([tfidf_feat, numeric_pad]).astype(np.float32)
        tensor = torch.FloatTensor(features)

        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)
            top_probs, top_idx = torch.topk(probs, 3, dim=1)

        print(f"\n🔍 '{query}'")
        for rank, (prob, idx) in enumerate(zip(top_probs[0], top_idx[0]), 1):
            herb_name = id_to_name[idx.item()]
            row = df[df[ID_COLUMN] == herb_name]
            rasa_val = str(row["rasa"].values[0]) if len(row) > 0 else ""
            virya_val = str(row["virya"].values[0]) if len(row) > 0 else ""
            print(f"   {rank}. {herb_name} (Rasa: {rasa_val}, Virya: {virya_val}) — {prob.item()*100:.2f}%")

    print(f"\n{'=' * 60}")
    print(f"📦 All 3 artifacts saved to: {OUTPUT_DIR}/")
    print(f"   • herb_model.pth")
    print(f"   • model_metadata.json")
    print(f"   • herb_lookup.csv")
    print(f"\n📊 Final accuracy: {acc_top1:.1f}% (Top-1) | {acc_top5:.1f}% (Top-5)")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
