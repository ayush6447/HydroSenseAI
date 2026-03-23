# YOLOv8 training on PlantVillage dataset
# Dataset: https://www.kaggle.com/datasets/emmarex/plantdisease
from ultralytics import YOLO
import os

# Classes from PlantVillage (emmarex/plantdisease):
# Pepper: Bacterial_spot, healthy (2)
# Potato: Early_blight, Late_blight, healthy (3)
# Tomato: Bacterial_spot, Early_blight, Late_blight, Leaf_Mold,
#         Septoria_leaf_spot, Spider_mites, Target_Spot,
#         YellowLeaf_Curl_Virus, mosaic_virus, healthy (10)
# Total: 15 classes

def train():
    model = YOLO("yolov8n-cls.pt")  # classification model
    results = model.train(
        data=os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/images/PlantVillage")),
        epochs=50,
        imgsz=224,
        batch=32,
        project=os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend/saved_models")),
        name="yolov8_plant",
        pretrained=True,
    )
    print(f"Training complete. Results: {results}")

if __name__ == "__main__":
    train()
