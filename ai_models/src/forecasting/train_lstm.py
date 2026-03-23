import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend")))
from app.ml.lstm_model import LSTMForecaster

WINDOW = 30
FEATURES = ['pH','TDS','water_temp','DHT_temp','DHT_humidity','water_level']
TARGETS = ['pH','TDS']

def make_sequences(df, window=WINDOW):
    X, y = [], []
    vals = df[FEATURES].values
    tgts = df[TARGETS].values
    for i in range(len(vals) - window):
        X.append(vals[i:i+window])
        y.append(tgts[i+window])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

def train():
    base_dir = os.path.dirname(__file__)
    in_path = os.path.join(base_dir, "../../data/processed/resampled_1min.csv")
    df = pd.read_csv(in_path)
    X, y = make_sequences(df)
    model = LSTMForecaster()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.MSELoss()
    X_t, y_t = torch.tensor(X), torch.tensor(y)
    for epoch in range(50):
        model.train()
        optimizer.zero_grad()
        loss = criterion(model(X_t), y_t)
        loss.backward()
        optimizer.step()
        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {loss.item():.4f}")
    out_path = os.path.join(base_dir, "../../../backend/saved_models/lstm_forecast.pt")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    torch.save(model.state_dict(), out_path)
    print(f"LSTM model saved to {out_path}")

if __name__ == "__main__":
    train()
