"""
YOLOv8 Plant Disease Classifier — Prompt Templates

System, user, annotation, and few-shot prompts for PlantVillage disease detection.
All templates use {variable} placeholders for .format(**kwargs) substitution.
"""

PLANTVILLAGE_CLASSES = [
    "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Tomato_Bacterial_spot", "Tomato_Early_blight", "Tomato_Late_blight",
    "Tomato_Leaf_Mold", "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two-spotted_spider_mite", "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus", "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy"
]

YOLO_SYSTEM_PROMPT = """You are a plant pathology AI assistant integrated into
a hydroponic farm dashboard. You analyze leaf images using a YOLOv8
classification model trained on the PlantVillage dataset.

You can identify 15 classes across 3 crops:
TOMATO (10): Bacterial_spot, Early_blight, Late_blight, Leaf_Mold,
  Septoria_leaf_spot, Spider_mites, Target_Spot, YellowLeaf_Curl_Virus,
  mosaic_virus, healthy
PEPPER (2): Bacterial_spot, healthy
POTATO (3): Early_blight, Late_blight, healthy

When reporting a detection:
1. Name the disease in plain English (not the class label)
2. Explain what the disease looks like and how it spreads
3. Give 2-3 treatment recommendations for a hydroponic environment
4. Rate urgency: LOW / MEDIUM / HIGH / CRITICAL
5. Always note that AI-assisted detection should be confirmed by physical inspection"""

YOLO_USER_TEMPLATE = """YOLOv8 analyzed a leaf image from my hydroponic system:

Detected class: {detected_class}
Confidence: {confidence}%
Crop type: {crop}

Please provide:
1. What disease or condition is this?
2. What visible symptoms should I look for to confirm?
3. How quickly does this spread in a closed hydroponic environment?
4. Top 3 treatments I can apply today?
5. Which other plants in my system are at risk?
6. Should I isolate this plant?

Current environment:
- Air temp: {dht_temp}C
- Humidity: {dht_humidity}%
- Water temp: {water_temp}C"""

YOLO_ANNOTATION_TEMPLATE = """You are creating training annotations for a
plant disease detection model (PlantVillage dataset).

For the image class "{class_name}", describe:

1. PRIMARY VISUAL FEATURES (what the model should detect):
   - Lesion shape and color
   - Distribution pattern on leaf
   - Texture changes
   - Unique markers

2. SIMILAR CLASSES (potential confusion and distinguishing features):
   - List 2-3 visually similar classes
   - Key differences to distinguish them

3. AUGMENTATION NOTES:
   - Safe augmentations (rotation, flip, brightness)
   - Augmentations that destroy diagnostic features

4. CONFIDENCE THRESHOLD (suggest 0.70-0.95):
   - Minimum confidence to report this class
   - Response when confidence is below threshold

Respond in structured JSON format."""

YOLO_FEW_SHOT_EXAMPLES = [
    {"class": "Tomato_Late_blight", "confidence": 91,
     "response": ("Late blight (Phytophthora infestans) detected — HIGH confidence. "
                  "Look for water-soaked, dark brown lesions with white mold on leaf undersides. "
                  "CRITICAL urgency — spreads extremely fast in humid conditions. "
                  "Actions: (1) Remove and bag infected leaves immediately, "
                  "(2) Reduce humidity below 70%, "
                  "(3) Apply copper-based fungicide to remaining plants.")},
    {"class": "Tomato_healthy", "confidence": 97,
     "response": ("Plant appears healthy. No disease detected. "
                  "Continue current growing conditions. Schedule next inspection in 48 hours.")},
    {"class": "Tomato_Leaf_Mold", "confidence": 73,
     "response": ("Possible Leaf Mold detected — moderate confidence, physical inspection recommended. "
                  "Check for pale green/yellow spots on upper leaf surface with olive-green mold below. "
                  "MEDIUM urgency. Actions: (1) Improve air circulation, "
                  "(2) Reduce humidity to 60-65%, (3) Remove heavily infected leaves.")},
]
