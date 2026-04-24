import torch
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from typing import List, Dict
from utils.logger import logger

def calculate_metrics(y_true: List[int], y_pred: List[int], classes: List[str]) -> Dict:
    """
    Calculates evaluation metrics: Accuracy, Precision, Recall, F1, Confusion Matrix.
    """
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
    
    cm = confusion_matrix(y_true, y_pred)
    
    metrics = {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": cm.tolist()
    }
    
    logger.info(f"Evaluation Metrics: Acc={accuracy:.4f}, F1={f1:.4f}")
    return metrics
