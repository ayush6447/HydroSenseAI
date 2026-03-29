from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
import os
import time
import asyncio
import random
from fastapi import UploadFile, File
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "hydrosense")
mongo_client = None
mongo_db = None

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    mongo_db = mongo_client[MONGO_DB]
    mongo_client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}. Logging disabled.")

from schemas import (
    SensorInput, 
    ActuatorControl, 
    AIOrchestratorOutput,
    LoginRequest,
    TokenResponse
)

app = FastAPI(title="HydroSenseAI")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"REQUEST: {request.method} {request.url}")
    response = await call_next(request)
    print(f"RESPONSE: Status {response.status_code}")
    return response

# Authentication Config
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer(auto_error=False)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    # Bypassing for auth-free version as requested
    return "admin"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dummy user db
users_db = {
    "farmer": "password"
}

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest):
    if req.username in users_db and users_db[req.username] == req.password:
        access_token = create_access_token(data={"sub": req.username})
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/health")
def health():
    return {"status": "ok"}

# Global state for real hardware sensors
latest_sensor_data: Optional[Dict[str, Any]] = None

# Simulation mode
simulation_active = False
simulation_task = None

async def sensor_simulator():
    """Background task that generates organic sensor fluctuations for demo mode"""
    global latest_sensor_data
    # Seed with realistic baseline values
    latest_sensor_data = {
        "ph": 6.0, "tds": 1200.0, "water_level": 2,
        "dht_temp": 24.5, "dht_humidity": 58.0, "water_temp": 21.5
    }
    while simulation_active:
        try:
            latest_sensor_data["ph"] = max(0, min(14, latest_sensor_data["ph"] + random.uniform(-0.03, 0.03)))
            latest_sensor_data["tds"] = max(0, min(5000, latest_sensor_data["tds"] + random.uniform(-3.0, 3.0)))
            latest_sensor_data["water_temp"] += random.uniform(-0.1, 0.1)
            latest_sensor_data["dht_temp"] += random.uniform(-0.1, 0.1)
            latest_sensor_data["dht_humidity"] = max(0, min(100, latest_sensor_data["dht_humidity"] + random.uniform(-0.5, 0.5)))
        except Exception:
            pass
        await asyncio.sleep(2)

@app.post("/api/simulation/start")
async def start_simulation(username: str = Depends(verify_token)):
    global simulation_active, simulation_task
    if simulation_active:
        return {"status": "already_running"}
    simulation_active = True
    simulation_task = asyncio.create_task(sensor_simulator())
    return {"status": "started", "message": "Simulation mode active. Generating synthetic sensor data."}

@app.post("/api/simulation/stop")
async def stop_simulation(username: str = Depends(verify_token)):
    global simulation_active, simulation_task, latest_sensor_data
    simulation_active = False
    if simulation_task:
        simulation_task.cancel()
        simulation_task = None
    latest_sensor_data = None
    return {"status": "stopped", "message": "Simulation stopped. Waiting for real hardware."}

@app.get("/api/simulation/status")
def simulation_status():
    return {"active": simulation_active}

latest_actuator_state: Dict[str, Any] = {
    "ph_reducer": False,
    "add_water": False,
    "nutrients_adder": False,
    "humidifier": False,
    "exhaust_fan": False
}

actuator_last_on_time: Dict[str, float] = {
    "ph_reducer": 0.0,
    "add_water": 0.0,
    "nutrients_adder": 0.0,
    "humidifier": 0.0,
    "exhaust_fan": 0.0
}
COOLDOWN_SECONDS = 5 * 60

@app.get("/api/sensor")
def get_sensor_data(username: str = Depends(verify_token)):
    """Retrieve the latest sensor data."""
    return latest_sensor_data

@app.post("/api/sensor", response_model=SensorInput)
def ingest_sensor_data(data: SensorInput, username: str = Depends(verify_token)):
    """Ingest new sensor data."""
    global latest_sensor_data
    latest_sensor_data = data.model_dump()
    return latest_sensor_data

def get_cooldown_status() -> Dict[str, bool]:
    current_time = time.time()
    return {
        key: (current_time - last_on) < COOLDOWN_SECONDS 
        for key, last_on in actuator_last_on_time.items()
    }

@app.post("/api/orchestrate")
def orchestrate(username: str = Depends(verify_token)):
    import traceback as tb
    try:
        global latest_actuator_state, actuator_last_on_time
        current_time = time.time()
    
        if latest_sensor_data is None:
            return {
                "orchestrator_output": {
                    "status": "OFFLINE",
                    "priority_action": "SENSORS DISCONNECTED. WAITING FOR HARDWARE TELEMETRY.",
                    "human_escalation": True,
                    "predicted_yield": "N/A"
                },
                "actuator_state": {key: False for key in latest_actuator_state},
                "insights": {
                    "next_ph": "N/A",
                    "next_tds": "N/A"
                },
                "system_fault": {
                    "is_default": True,
                    "probability": 1.0
                },
                "meta": {
                    "source": "ml_model",
                    "model_version": "v1.1",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            }
            
        # Real AI Models Inference
        from app.ml.inference import predict_yield, predict_forecast, predict_fault
        
        yield_score = predict_yield(latest_sensor_data, latest_actuator_state)
        next_ph, next_tds = predict_forecast(latest_sensor_data)
        fault, fault_prob = predict_fault(latest_sensor_data, latest_actuator_state)
        
        # --- AI Intelligence Layer ---
        target_state = {key: False for key in latest_actuator_state}
        status = "GREEN"
        action = "System optimizing for peak biological yield. Forecasts stable."
        escalation = False
        
        if fault:
            status = "RED"
            action = f"Critical anomaly detected ({fault_prob*100:.1f}%). Immediate physical inspection required."
            escalation = True
            target_state["add_water"] = True
        elif yield_score < 75.0:
            if latest_sensor_data.get("tds", 0) < 900:
                status = "YELLOW"
                action = "Yield drop predicted due to nutrient deficiency. Automatically dosing +15% TDS."
                target_state["nutrients_adder"] = True
            elif latest_sensor_data.get("ph", 7) > 6.5:
                status = "YELLOW"
                action = "Sub-optimal yield expected from alkaline stress. Applying pH reducer."
                target_state["ph_reducer"] = True
            else:
                status = "YELLOW"
                action = "Yield trending poorly. Attempting to cool ambient environment to mitigate stress."
                target_state["exhaust_fan"] = True
                escalation = True
        elif isinstance(next_ph, float) and next_ph > 6.8:
            status = "YELLOW"
            action = f"LSTM Forecast predicts pH spike to {next_ph:.1f} in 30 cycles. Pre-dosing reducer."
            target_state["ph_reducer"] = True
        elif isinstance(next_tds, float) and next_tds < 900:
            status = "YELLOW"
            action = f"LSTM Forecast predicts TDS depletion to {next_tds:.0f} ppm. Pre-dosing nutrients."
            target_state["nutrients_adder"] = True
            
        # Enforce Cooldowns
        applied_state = {}
        cooldowns = get_cooldown_status()
        for act, is_on in target_state.items():
            if is_on and not cooldowns[act]:
                applied_state[act] = True
                actuator_last_on_time[act] = current_time
            else:
                applied_state[act] = False
                
        latest_actuator_state = applied_state
        
        if next_ph == "insufficient_data":
            next_ph, next_tds = "Warming up...", "Warming up..."
            
        print("\n--- NEW ORCHESTRATION CYCLE ---")
        print("INPUT SENSORS: ", latest_sensor_data)
        print("YIELD PREDICT: ", yield_score)
        print(f"FAULT DETECT:   IS_DEFAULT={fault} | PROB={fault_prob:.4f}")
        print("FORECAST PH/TDS:", next_ph, next_tds)
        print("-------------------------------\n")
        
        result = {
            "orchestrator_output": {
                "status": status,
                "priority_action": action,
                "human_escalation": escalation,
                "predicted_yield": yield_score
            },
            "actuator_state": latest_actuator_state,
            "insights": {
                "next_ph": next_ph,
                "next_tds": next_tds
            },
            "system_fault": {
                "is_default": fault,
                "probability": fault_prob
            },
            "meta": {
                "source": "ml_model",
                "model_version": "v1.1",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
        
        # Persist to MongoDB Atlas
        if mongo_db is not None:
            try:
                log_entry = {
                    **result,
                    "sensor_snapshot": latest_sensor_data,
                    "logged_at": datetime.utcnow()
                }
                mongo_db.orchestration_logs.insert_one(log_entry)
            except Exception as db_err:
                print(f"MongoDB write error: {db_err}")
        
        return result
    except Exception as e:
        error_trace = tb.format_exc()
        print(f"ORCHESTRATE CRASH: {error_trace}")
        return {"error": str(e), "traceback": error_trace}
    
@app.post("/api/actuators/reset")
def reset_actuators(username: str = Depends(verify_token)):
    global latest_actuator_state, actuator_last_on_time
    latest_actuator_state = {key: False for key in latest_actuator_state}
    actuator_last_on_time = {key: 0.0 for key in actuator_last_on_time}
    return {"status": "reset", "state": latest_actuator_state}

@app.post("/api/actuators/isolate")
def isolate_system(username: str = Depends(verify_token)):
    return {"status": "isolated", "state": latest_actuator_state}

@app.post("/api/predict/plant-health")
async def predict_plant_health(file: UploadFile = File(...), username: str = Depends(verify_token)):
    contents = await file.read()
    from app.ml.inference import predict_disease
    diagnosis, conf = predict_disease(contents)
    return {"diagnosis": diagnosis.upper(), "confidence": f"{conf*100:.1f}%"}
