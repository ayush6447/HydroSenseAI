import pandas as pd
import numpy as np

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Rolling statistics (useful for LSTM input features)
    df['ph_rolling_mean_10'] = df['pH'].rolling(10).mean()
    df['tds_rolling_mean_10'] = df['TDS'].rolling(10).mean()
    df['ph_rate_of_change'] = df['pH'].diff()
    df['tds_rate_of_change'] = df['TDS'].diff()
    # pH deviation from optimal (5.8)
    df['ph_deviation'] = abs(df['pH'] - 5.8)
    return df.dropna()
