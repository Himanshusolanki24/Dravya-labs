"""
Helper script to download the AyurGenixAI dataset from Kaggle.
Since the Kaggle CLI is not installed, this provides instructions
and a directory structure for manual placement.
"""

import os

def check_dataset():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    os.makedirs(dataset_dir, exist_ok=True)
    
    files = os.listdir(dataset_dir)
    has_csv = any(f.endswith('.csv') or f.endswith('.xlsx') for f in files)
    
    if has_csv:
        print(f"✅ Dataset found in {dataset_dir}!")
        for f in files:
            print(f"  - {f}")
    else:
        print(f"❌ Dataset NOT FOUND in {dataset_dir}")
        print("\nSince Kaggle CLI is missing, please download manually:")
        print("1. Go to: https://www.kaggle.com/datasets/kagglekirti123/ayurgenixai-ayurvedic-dataset")
        print("2. Click 'Download' (top right)")
        print(f"3. Extract the ZIP file into: {dataset_dir}")
        print("4. Then run the training script.")

if __name__ == "__main__":
    check_dataset()
