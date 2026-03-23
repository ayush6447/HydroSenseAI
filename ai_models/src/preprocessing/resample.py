import pandas as pd

def resample_to_uniform(path: str, freq: str = "1min") -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['timestamp'])
    df = df.set_index('timestamp').sort_index()
    # Resample to uniform intervals, forward-fill sensor values
    sensor_cols = ['pH','TDS','water_level','DHT_temp','DHT_humidity','water_temp']
    actuator_cols = ['pH_reducer','add_water','nutrients_adder','humidifier','ex_fan']
    df_resampled = df[sensor_cols].resample(freq).mean().interpolate(method='linear')
    df_actuators = df[actuator_cols].resample(freq).max().fillna(0)
    return pd.concat([df_resampled, df_actuators], axis=1).reset_index()

if __name__ == "__main__":
    import os
    in_path = os.path.join(os.path.dirname(__file__), "../../data/processed/cleaned.csv")
    out_path = os.path.join(os.path.dirname(__file__), "../../data/processed/resampled_1min.csv")
    df = resample_to_uniform(in_path)
    df.to_csv(out_path, index=False)
    print(f"Resampled dataset saved to {out_path}: {df.shape}")
