import torch
import torch.nn as nn

class DiabetesModel(nn.Module):
    """
    Architecture must match train_model.py exactly:
    fc1(8→128) → bn1 → relu → dropout(0.3)
    fc2(128→64) → bn2 → relu → dropout(0.3)
    fc3(64→16) → bn3 → relu
    fc4(16→1)
    """
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

def load_model(model_path: str, input_dim=8):
    model = DiabetesModel(input_dim)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model, device
