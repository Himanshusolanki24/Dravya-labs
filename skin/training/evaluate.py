"""Framework-neutral evaluation helpers for the TensorFlow skin model."""

from typing import Dict, List

from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix


def calculate_metrics(y_true: List[int], y_pred: List[int], classes: List[str]) -> Dict:
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    return {"accuracy": float(accuracy), "precision": float(precision), "recall": float(recall),
            "f1_score": float(f1), "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(), "classes": classes}
