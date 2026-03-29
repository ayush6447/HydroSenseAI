<div align="center">

# 🌿 HydroSenseAI

### AI-Powered Decision Engine for Hydroponic Systems

*A real-time ML orchestration platform that integrates XGBoost yield prediction, LSTM time-series forecasting, YOLOv8 plant disease detection, and anomaly classification with verified causal inference and full observability.*

**Team:** Rishav · Ayush · Rounak · Amrit · Aastha

---

</div>

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  Dashboard · Sensor Matrix · Yield Card · YOLO Diagnostics  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (axios + react-query)
┌───────────────────────────▼─────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  Auth · Sensor Ingestion · AI Orchestrator · Actuator Ctrl  │
│                                                             │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐│
│  │  XGBoost    │ │ LSTM (PyTorch)│ │ Fault Classifier      ││
│  │  Yield      │ │ Forecast     │ │ (scikit-learn)         ││
│  └─────────────┘ └──────────────┘ └───────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │         YOLOv8 Plant Disease Detector (ultralytics)      ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │  IoT Hardware (ESP32/RPi)   │
              │  pH · TDS · Temp · Humidity │
              │  Pumps · Fans · Dosers      │
              └────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Dashboard opens at `http://localhost:3000`.  
API docs at `http://localhost:8000/docs`.

---

## 🧠 AI Models

### 1. XGBoost Yield Predictor
| Property | Value |
|----------|-------|
| **File** | `backend/saved_models/xgboost_yield.pkl` |
| **Input** | 11 features (6 sensors + 5 actuators) |
| **Output** | Yield health score (0–100) |
| **Training Data** | `cleaned_data_IsDefault_Interpolate.csv` (50,570 rows) |

**Feature Order (frozen):**
```python
["ph", "tds", "water_level", "dht_temp", "dht_humidity", "water_temp",
 "ph_reducer", "add_water", "nutrients_adder", "humidifier", "exhaust_fan"]
```

### 2. LSTM Time-Series Forecaster
| Property | Value |
|----------|-------|
| **File** | `backend/saved_models/lstm_forecast.pt` |
| **Input** | 30-step rolling window × 6 sensor channels |
| **Output** | Next predicted pH and TDS values |
| **Architecture** | 2-layer LSTM (input=6, hidden=64, output=2) |
| **Warm-up** | Refuses to predict until 30 real readings are collected |

**Proactive Dosing Triggers:**
- Predicted pH > 6.5 → pre-trigger `ph_reducer`
- Predicted TDS < 800 → pre-trigger `nutrients_adder`

### 3. YOLOv8 Plant Disease Classifier
| Property | Value |
|----------|-------|
| **File** | `backend/saved_models/yolov8_plant.pt` |
| **Input** | RGB leaf image (any resolution) |
| **Output** | Disease class + confidence % |
| **Dataset** | [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) (~20,000 images) |

**15 Supported Disease Classes:**
- **Tomato (10):** Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy
- **Pepper (2):** Bacterial Spot, Healthy
- **Potato (3):** Early Blight, Late Blight, Healthy

### 4. isDefault Fault Classifier
| Property | Value |
|----------|-------|
| **File** | `backend/saved_models/classifier_isdefault.pkl` |
| **Input** | 11 features (same as XGBoost) |
| **Output** | Binary (0=Normal, 1=Fault) + probability |
| **Class Imbalance** | 98.2% normal / 1.8% fault → handled with SMOTE |
| **Threshold** | probability > 0.20 (high sensitivity) |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Returns JWT token. Body: `{username, password}` |

Default credentials: `farmer` / `password`

### Sensor Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sensor` | Get latest sensor readings (returns `null` if no hardware connected) |
| `POST` | `/api/sensor` | Ingest new sensor reading from IoT hardware |

**Sensor Payload Schema:**
```json
{
  "ph": 5.9, "tds": 1148, "water_level": 2,
  "dht_temp": 24.3, "dht_humidity": 63.4, "water_temp": 21.5,
  "ph_reducer": "OFF", "add_water": "OFF",
  "nutrients_adder": "OFF", "humidifier": "OFF", "ex_fan": "OFF"
}
```

### AI Orchestration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orchestrate` | Runs all 4 ML models and returns unified AI decision |

**Response Structure:**
```json
{
  "orchestrator_output": {
    "status": "GREEN | YELLOW | RED | OFFLINE",
    "priority_action": "Human-readable AI decision string",
    "human_escalation": false,
    "predicted_yield": 87.3
  },
  "actuator_state": { "ph_reducer": false, "add_water": false, ... },
  "insights": { "next_ph": 6.1, "next_tds": 1050 },
  "system_fault": { "is_default": false, "probability": 0.0001 },
  "meta": { "source": "ml_model", "model_version": "v1.1", "timestamp": "..." }
}
```

### Plant Disease Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict/plant-health` | Upload leaf image (`multipart/form-data`) → YOLOv8 diagnosis |

### Actuator Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/actuators/reset` | Reset all actuators to OFF |
| `POST` | `/api/actuators/isolate` | Emergency isolation |

---

## 🧬 Intelligence Layer Workflow

The orchestrator doesn't just return raw ML numbers — it synthesizes them into **decisions**:

```
Sensor Data → XGBoost + LSTM + Fault Classifier
                        ↓
              Intelligence Engine
                        ↓
         Contextual Human-Readable Action
```

### Priority Order (highest wins)
1. **FAULT** detected → `RED` → "Critical anomaly detected. Immediate physical inspection required."
2. **Yield < 75%** → Cross-references TDS/pH to determine root cause → auto-triggers corrective actuator
3. **LSTM Forecast** predicts future pH spike or TDS drop → `YELLOW` → pre-doses proactively
4. **All clear** → `GREEN` → "System optimizing for peak biological yield."

### Actuator Cooldown
5-minute cooldown enforced on all actuators to prevent relay hammering.

---

## 🔒 Safety & Validation

| Protection | Description |
|------------|-------------|
| **Input Validation** | Rejects physically impossible values (pH > 14, TDS < 0, etc.) |
| **Feature Ordering** | Frozen `FEATURE_ORDER` arrays prevent silent column-swapping |
| **LSTM Warm-up** | Model refuses to forecast until 30 real readings are buffered |
| **API Trust Assertion** | Frontend rejects responses where `meta.source ≠ "ml_model"` |
| **Hardware Disconnection** | Dashboard shows "Hardware Disconnected" instead of fake data when no sensors are connected |

### Optimal Sensor Ranges
| Sensor | Min | Max | Ideal |
|--------|-----|-----|-------|
| pH | 5.5 | 6.5 | 5.8 |
| TDS | 800 | 1600 ppm | 1100–1300 |
| Water Temp | 18°C | 24°C | 21°C |
| Air Temp | 20°C | 28°C | — |
| Humidity | 50% | 80% | — |
| Water Level | 2 | 3 | — |

---

## 📂 Project Structure

```
HydroSenseAI/
├── backend/
│   ├── app/ml/
│   │   └── inference.py          # ML model loading & inference
│   ├── saved_models/             # Trained model weights (.pkl, .pt)
│   ├── main.py                   # FastAPI server & AI orchestrator
│   ├── schemas.py                # Pydantic data models
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx          # Main dashboard page
│   │   ├── components/           # React UI components
│   │   └── lib/api.ts            # Axios API client
│   ├── package.json
│   └── tailwind.config.ts
├── ai_models/
│   ├── data/                     # Raw datasets
│   ├── notebooks/                # Jupyter training notebooks
│   ├── saved_models/             # Model artifacts
│   └── src/                      # Training scripts
└── README.md
```

---

## 🏋️ Training Pipeline

```bash
# 1. Prepare data
cd ai_models
python src/preprocessing/clean.py

# 2. Train individual models
python src/yield_prediction/train_xgboost.py
python src/forecasting/train_lstm.py
python src/plant_vision/train_yolo.py
python src/fault_detection/train_classifier.py

# 3. Copy trained weights to backend
cp saved_models/* ../backend/saved_models/
```

### Datasets
| Dataset | Rows/Images | Source |
|---------|-------------|--------|
| IoT Sensor Logs | 50,570 rows (Nov–Dec 2023) | Custom ESP32 farm |
| PlantVillage | ~20,000 images (15 classes) | [Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TailwindCSS, React Query, Axios |
| Backend | FastAPI, Python 3.11, Pydantic, JWT Auth |
| ML Models | XGBoost, PyTorch (LSTM), Ultralytics (YOLOv8), scikit-learn |
| Data | NumPy, Pandas, SMOTE (imbalanced-learn) |

---

<div align="center">

**Built with 🌱 for the future of precision agriculture.**

</div>
