import torch
import argparse
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
import json
import copy
import time
from pathlib import Path
from utils.logger import logger
from utils.helpers import get_model_path, get_config_path
from training.dataset import HFSkinDataset
from training.transform import get_train_transforms, get_val_transforms
from training.evaluate import calculate_metrics
from app.model_loader import get_skin_model


class TransformSubset(torch.utils.data.Dataset):
    """Wraps a Subset to apply specific transforms (train vs val)."""

    def __init__(self, subset, transform=None):
        self.subset = subset
        self.transform = transform

    def __getitem__(self, index):
        x, y = self.subset[index]
        if self.transform:
            x = self.transform(x)
        return x, y

    def __len__(self):
        return len(self.subset)


def train_model(
    dataset_name="Nagabu/HAM10000",
    num_epochs=10,
    batch_size=32,
    learning_rate=1e-4,
    max_samples=None,
):
    """
    Main training function.

    Args:
        dataset_name: HuggingFace dataset identifier.
        num_epochs: Number of training epochs.
        batch_size: Batch size for DataLoaders.
        learning_rate: Learning rate for Adam optimizer.
        max_samples: Limit total samples (None = use all).
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")

    # 1. Dataset Initialization
    logger.info(f"Initializing dataset: {dataset_name}...")
    full_dataset = HFSkinDataset(
        dataset_name=dataset_name,
        split="train",
        max_samples=max_samples,
    )

    # Save class mapping
    classes = full_dataset.classes
    num_classes = len(classes)
    class_to_idx = full_dataset.class_to_idx

    if num_classes == 0:
        logger.error("No classes found in dataset. Check dataset name and HF token.")
        return

    # Save config
    config_data = {
        "classes": classes,
        "class_to_idx": class_to_idx,
        "descriptions": {c: f"Skin condition: {c}" for c in classes},
    }
    config_path = get_config_path()
    with open(config_path, "w") as f:
        json.dump(config_data, f, indent=4)
    logger.info(f"Saved model config with {num_classes} classes to {config_path}")

    # 2. Train/Val Split (80/20)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

    # Disable base dataset transform so we can apply specific ones
    full_dataset.transform = None

    train_dataset = TransformSubset(train_dataset, transform=get_train_transforms())
    val_dataset = TransformSubset(val_dataset, transform=get_val_transforms())

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=0
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False, num_workers=0
    )

    logger.info(f"Train: {train_size} samples, Val: {val_size} samples")

    # 3. Model Setup
    model = get_skin_model(num_classes=num_classes, device=device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # 4. Training Loop
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    patience = 3
    early_stop_counter = 0

    logger.info("Starting training loop...")

    for epoch in range(num_epochs):
        logger.info(f"Epoch {epoch + 1}/{num_epochs}")
        logger.info("-" * 30)

        start_time = time.time()

        for phase in ["train", "val"]:
            if phase == "train":
                model.train()
                dataloader = train_loader
            else:
                model.eval()
                dataloader = val_loader

            running_loss = 0.0
            running_corrects = 0
            all_preds = []
            all_labels = []

            for inputs, labels in dataloader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == "train"):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == "train":
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

                if phase == "val":
                    all_preds.extend(preds.cpu().numpy())
                    all_labels.extend(labels.cpu().numpy())

            epoch_loss = running_loss / len(dataloader.dataset)
            epoch_acc = running_corrects.double() / len(dataloader.dataset)

            logger.info(f"{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == "val":
                calculate_metrics(all_labels, all_preds, classes)

                if epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_wts = copy.deepcopy(model.state_dict())
                    early_stop_counter = 0
                    # Save intermediate best
                    torch.save(best_model_wts, get_model_path())
                    logger.info(f"New best model saved (acc={epoch_acc:.4f})")
                else:
                    early_stop_counter += 1

        if early_stop_counter >= patience:
            logger.info(f"Early stopping triggered after {epoch + 1} epochs.")
            break

        time_elapsed = time.time() - start_time
        logger.info(
            f"Epoch complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s"
        )

    logger.info(f"Best val Acc: {best_acc:.4f}")

    # Load best model weights and save final
    model.load_state_dict(best_model_wts)
    model_path = get_model_path()
    torch.save(model.state_dict(), model_path)
    logger.info(f"Final model saved to {model_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Skin AI Model")
    parser.add_argument("--dataset", type=str, default="Nagabu/HAM10000",
                        help="HuggingFace dataset name")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--max_samples", type=int, default=None,
                        help="Max samples (None for all)")
    args = parser.parse_args()

    train_model(
        dataset_name=args.dataset,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        max_samples=args.max_samples,
    )
