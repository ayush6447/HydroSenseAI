from ultralytics import YOLO
from PIL import Image
import numpy as np

model = None

def load_model(path="../../saved_models/yolov8_plant.pt"):
    global model
    model = YOLO(path)

def predict(image_path: str) -> dict:
    if model is None:
        load_model()
    results = model(image_path)
    top_class = results[0].probs.top1
    confidence = float(results[0].probs.top1conf)
    class_name = results[0].names[top_class]
    is_healthy = "healthy" in class_name.lower()
    return {
        "class": class_name,
        "confidence": round(confidence, 4),
        "is_healthy": is_healthy,
        "disease": None if is_healthy else class_name
    }
