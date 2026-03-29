import os
import joblib
import xgboost as xgb
import torch
import torch.nn as nn
import numpy as np
from collections import deque
from ultralytics import YOLO
from io import BytesIO
from PIL import Image

# Adjust base path dynamically in case it's run from different working directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

# Global history buffer for LSTM
history_buffer = deque(maxlen=30)

# We will define a dummy LSTM model class just to load the state_dict comfortably 
# if it's saved as a state_dict, or load it directly if saved as full model.
# Typically, forecast models return [next_ph, next_tds].
class DummyLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=64, output_size=2, num_layers=2):
        super(DummyLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

yield_model = None
fault_model = None
forecast_model = None
yolo_model = None

def load_models():
    global yield_model, fault_model, forecast_model, yolo_model
    try:
        # Load XGBoost Yield Model
        yield_model = xgb.XGBRegressor()
        yield_model_path = os.path.join(MODELS_DIR, "xgboost_yield.pkl")
        if os.path.exists(yield_model_path):
            # Using joblib just in case it was saved this way (common inside .pkl)
            yield_model = joblib.load(yield_model_path)
            
        # Load Fault Detection Model
        fault_model_path = os.path.join(MODELS_DIR, "classifier_isdefault.pkl")
        if os.path.exists(fault_model_path):
            fault_model = joblib.load(fault_model_path)
            
        # Load LSTM Forecaster
        forecast_model_path = os.path.join(MODELS_DIR, "lstm_forecast.pt")
        if os.path.exists(forecast_model_path):
            forecast_model = torch.load(forecast_model_path, map_location=torch.device('cpu'))
            if isinstance(forecast_model, dict):
                 # It's a state_dict, we instantiate DummyLSTM
                 model = DummyLSTM()
                 model.load_state_dict(forecast_model)
                 forecast_model = model
            forecast_model.eval()
            
        # Load YOLO Model
        yolo_model_path = os.path.join(MODELS_DIR, "yolov8_plant.pt")
        if os.path.exists(yolo_model_path):
            yolo_model = YOLO(yolo_model_path)
            
        print("Successfully loaded ML models.")
    except Exception as e:
        print(f"Error loading models: {e}")

# Load models at startup
load_models()

FEATURE_ORDER_XGB = ["ph", "tds", "water_level", "dht_temp", "dht_humidity", "water_temp", "ph_reducer", "add_water", "nutrients_adder", "humidifier", "exhaust_fan"]
FEATURE_ORDER_LSTM = ["ph", "tds", "water_level", "dht_temp", "dht_humidity", "water_temp"]

def validate_sensors(sensor_data):
    ph = float(sensor_data.get("ph", 6.0))
    tds = float(sensor_data.get("tds", 1000.0))
    dht_temp = float(sensor_data.get("dht_temp", 24.0))
    dht_humidity = float(sensor_data.get("dht_humidity", 60.0))
    water_temp = float(sensor_data.get("water_temp", 22.0))
    
    if not (0 <= ph <= 14): raise ValueError(f"Invalid pH: {ph}")
    if not (0 <= tds <= 5000): raise ValueError(f"Invalid TDS: {tds}")
    if not (-20 <= dht_temp <= 60): raise ValueError(f"Invalid Temp: {dht_temp}")
    if not (0 <= dht_humidity <= 100): raise ValueError(f"Invalid Humidity: {dht_humidity}")
    if not (-10 <= water_temp <= 50): raise ValueError(f"Invalid Water Temp: {water_temp}")

def extract_features(sensor_data, actuator_state):
    """
    Extracts the 11 features in a verified, frozen order.
    """
    validate_sensors(sensor_data)
    
    feats = []
    # append sensor features
    for f in FEATURE_ORDER_XGB[:6]:
        feats.append(float(sensor_data.get(f, 0.0)))
    # append actuator features
    for f in FEATURE_ORDER_XGB[6:]:
        feats.append(1.0 if actuator_state.get(f) else 0.0)
        
    return np.array([feats])

def predict_yield(sensor_data, actuator_state):
    if yield_model is None:
        return 85.0
    features = extract_features(sensor_data, actuator_state)
    try:
        score = yield_model.predict(features)[0]
        return float(score)
    except Exception as e:
        print(f"Yield prediction error: {e}")
        return 85.0

def predict_fault(sensor_data, actuator_state):
    if fault_model is None:
        return False, 0.0
    features = extract_features(sensor_data, actuator_state)
    try:
        is_default = fault_model.predict(features)[0]
        prob = fault_model.predict_proba(features)[0][1] if hasattr(fault_model, "predict_proba") else float(is_default)
        return bool(is_default), float(prob)
    except Exception as e:
        print(f"Fault prediction error: {e}")
        return False, 0.0

def predict_forecast(sensor_data):
    validate_sensors(sensor_data)
    
    reading = [float(sensor_data.get(f, 0.0)) for f in FEATURE_ORDER_LSTM]
    history_buffer.append(reading)

    if forecast_model is None or len(history_buffer) < 30:
        return "insufficient_data", "insufficient_data"
        
    try:
        # Build 30-step window from history deque directly without filling
        window_list = list(history_buffer)
        window = np.array(window_list) # shape (30, 6)
        window = torch.tensor(window, dtype=torch.float32).unsqueeze(0) # shape (1, 30, 6)
        
        with torch.no_grad():
            out = forecast_model(window)
        
        return float(out[0][0]), float(out[0][1])
    except Exception as e:
        print(f"Forecast prediction error: {e}")
        return "insufficient_data", "insufficient_data"

def predict_disease(image_bytes):
    if yolo_model is None:
        return "MODEL_NOT_LOADED", 0.0
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        results = yolo_model(image)
        # Handle ultralytics probability tensor
        top1 = results[0].probs.top1
        conf = results[0].probs.top1conf.item()
        name = results[0].names[top1]
        return name, conf
    except Exception as e:
        print("YOLO error:", e)
        return "ERROR", 0.0
