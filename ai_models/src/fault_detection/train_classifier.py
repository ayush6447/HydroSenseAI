import pandas as pd, pickle
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from xgboost import XGBClassifier
from smote_balance import apply_smote

FEATURES = ['pH','TDS','water_level','DHT_temp','DHT_humidity','water_temp',
            'pH_reducer','add_water','nutrients_adder','humidifier','ex_fan']

def train():
    base_dir = os.path.dirname(__file__)
    in_path = os.path.join(base_dir, "../../data/processed/cleaned.csv")
    df = pd.read_csv(in_path)
    X, y = df[FEATURES], df['isDefault']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    test_out_path = os.path.join(base_dir, "../../data/processed/classifier_test.csv")
    X_test.assign(isDefault=y_test).to_csv(test_out_path, index=False)
    X_train, y_train = apply_smote(X_train, y_train)
    model = XGBClassifier(
        n_estimators=200,
        scale_pos_weight=55,  # 49670/900 ≈ 55
        max_depth=5,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print(classification_report(y_test, preds, target_names=['Normal', 'Fault']))
    out_path = os.path.join(base_dir, "../../../backend/saved_models/classifier_isdefault.pkl")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Fault classifier saved to {out_path}")

if __name__ == "__main__":
    train()
