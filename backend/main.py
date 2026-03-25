from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
import os
import time

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

# Global state to simulate live sensors and actutors
latest_sensor_data: Dict[str, Any] = {
    "ph": 6.0,
    "tds": 1500.0,
    "water_level": 2,
    "dht_temp": 24.5,
    "dht_humidity": 55.0,
    "water_temp": 22.0
}

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

@app.get("/api/sensor", response_model=SensorInput)
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
    global latest_actuator_state, actuator_last_on_time
    current_time = time.time()
    
    # Mock AI Models Inference
    yield_score = 85
    next_ph = latest_sensor_data["ph"] + 0.1
    next_tds = latest_sensor_data["tds"] - 50.0
    fault = latest_sensor_data["water_level"] == 0
    
    # Orchestration Logic
    status = "GREEN"
    action = "System Optimal"
    escalation = False
    
    target_state = {key: False for key in latest_actuator_state}
    
    if fault:
        status = "RED"
        action = "Critical: Empty water reservoir!"
        escalation = True
        target_state["add_water"] = True
    elif latest_sensor_data["ph"] > 6.5:
        status = "YELLOW"
        action = "Lowering pH"
        target_state["ph_reducer"] = True
    elif latest_sensor_data["tds"] < 1000:
        status = "YELLOW"
        action = "Replenish nutrients"
        target_state["nutrients_adder"] = True
    elif latest_sensor_data["dht_temp"] > 28:
        status = "YELLOW"
        action = "Cooling ambient air"
        target_state["exhaust_fan"] = True
        
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
    
    return {
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
        }
    }
    
@app.post("/api/actuators/reset")
def reset_actuators(username: str = Depends(verify_token)):
    global latest_actuator_state, actuator_last_on_time
    latest_actuator_state = {key: False for key in latest_actuator_state}
    actuator_last_on_time = {key: 0.0 for key in actuator_last_on_time}
    return {"status": "reset", "state": latest_actuator_state}

@app.post("/api/actuators/isolate")
def isolate_system(username: str = Depends(verify_token)):
    global latest_actuator_state
    latest_actuator_state = {key: False for key in latest_actuator_state}
    return {"status": "isolated", "state": latest_actuator_state}
