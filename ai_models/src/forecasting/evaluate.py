import torch, pandas as pd, numpy as np
from lstm_model import LSTMForecaster
from train_lstm import make_sequences

def evaluate():
    model = LSTMForecaster()
    model.load_state_dict(torch.load("../../saved_models/lstm_forecast.pt"))
    model.eval()
    df = pd.read_csv("../../data/processed/resampled_1min.csv")
    X, y = make_sequences(df)
    with torch.no_grad():
        preds = model(torch.tensor(X)).numpy()
    mae_ph = np.mean(np.abs(preds[:, 0] - y[:, 0]))
    mae_tds = np.mean(np.abs(preds[:, 1] - y[:, 1]))
    print(f"MAE pH: {mae_ph:.4f}, MAE TDS: {mae_tds:.2f}")
