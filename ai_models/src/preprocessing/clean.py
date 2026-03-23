import pandas as pd
import numpy as np

def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if 'timestamp' in df.columns:
        df = df.set_index('timestamp')
    elif 'time' in df.columns:
        df = df.rename(columns={'time': 'timestamp'}).set_index('timestamp')
    # Clip impossible sensor values
    df['TDS'] = df['TDS'].clip(lower=0, upper=2500)
    df['pH'] = df['pH'].clip(lower=4.0, upper=9.0)
    df['DHT_humidity'] = df['DHT_humidity'].clip(lower=0, upper=100)
    df['DHT_temp'] = df['DHT_temp'].clip(lower=10, upper=45)
    df['water_temp'] = df['water_temp'].clip(lower=10, upper=30)
    # Fill missing actuator values
    df['add_water'] = df['add_water'].fillna('OFF')
    # Encode actuators
    for col in ['pH_reducer','add_water','nutrients_adder','humidifier','ex_fan']:
        df[col] = df[col].map({'ON': 1, 'OFF': 0}).fillna(0).astype(int)
    return df

if __name__ == "__main__":
    import os
    import glob
    # Use the file with both timestamp and isDefault
    raw_dir = os.path.join(os.path.dirname(__file__), "../../data/raw")
    target_files = glob.glob(os.path.join(raw_dir, "IoTData_IsDefaultInterpolate_*.csv"))
    if not target_files:
        print("Raw data file not found!")
    else:
        file_path = target_files[0]
        df = load_and_clean(file_path)
        out_path = os.path.join(os.path.dirname(__file__), "../../data/processed/cleaned.csv")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        # Reset index to save timestamp column explicitly
        df.reset_index(names='timestamp').to_csv(out_path, index=False)
        print(f"Cleaned dataset saved to {out_path}: {df.shape}")
