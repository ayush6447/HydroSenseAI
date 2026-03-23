import pickle, pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score

def evaluate(model_path, data_path):
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    df = pd.read_csv(data_path)
    FEATURES = ['pH','TDS','water_level','DHT_temp','DHT_humidity','water_temp',
                'pH_reducer','add_water','nutrients_adder','humidifier','ex_fan']
    preds = model.predict(df[FEATURES])
    print("Feature importances:")
    for f, i in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {f}: {i:.4f}")
