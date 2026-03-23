import torch
import torch.nn as nn

class LSTMForecaster(nn.Module):
    def __init__(self, input_size=6, hidden_size=64, num_layers=2, output_size=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)  # predicts pH and TDS

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])  # last timestep
