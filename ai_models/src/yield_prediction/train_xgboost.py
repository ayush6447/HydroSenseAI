import pandas as pd
import numpy as np
import pickle
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

FEATURES = ['pH','TDS','water_level','DHT_temp','DHT_humidity','water_temp',
            'pH_reducer','add_water','nutrients_adder','humidifier','ex_fan']

def create_yield_label(df):
    # Proxy yield score: higher when pH and TDS are in optimal range
    ph_score = 100 - (abs(df['pH'] - 5.8) * 20).clip(0, 100)
    tds_score = 100 - (abs(df['TDS'] - 1200) / 10).clip(0, 100)
    temp_score = 100 - (abs(df['water_temp'] - 21) * 5).clip(0, 100)
    return (ph_score * 0.4 + tds_score * 0.4 + temp_score * 0.2)

def train():
    import os
    base_dir = os.path.dirname(__file__)
    in_path = os.path.join(base_dir, "../../data/processed/cleaned.csv")
    df = pd.read_csv(in_path)
    df['yield_score'] = create_yield_label(df)
    X = df[FEATURES]
    y = df['yield_score']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    test_out_path = os.path.join(base_dir, "../../data/processed/xgboost_test.csv")
    X_test.assign(yield_score=y_test).to_csv(test_out_path, index=False)
    model = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)
    preds = model.predict(X_test)
    print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")
    print(f"R2:  {r2_score(y_test, preds):.4f}")
    out_path = os.path.join(base_dir, "../../../backend/saved_models/xgboost_yield.pkl")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {out_path}")

if __name__ == "__main__":
    train()
