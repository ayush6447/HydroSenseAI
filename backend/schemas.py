from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional

class SensorInput(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="pH level")
    tds: float = Field(..., ge=-500.0, le=5000.0, description="Total Dissolved Solids")
    water_level: int = Field(..., ge=0, le=3, description="Physical reservoir status (0-3)")
    dht_temp: float = Field(..., ge=-20.0, le=100.0, description="Ambient air temperature")
    dht_humidity: float = Field(..., ge=0.0, description="Ambient air humidity")
    water_temp: float = Field(..., ge=-10.0, le=100.0, description="Solution temperature")

class ActuatorControl(BaseModel):
    ph_reducer: bool = False
    add_water: bool = False
    nutrients_adder: bool = False
    humidifier: bool = False
    exhaust_fan: bool = False

    @model_validator(mode='after')
    def validate_logic(self) -> 'ActuatorControl':
        if self.ph_reducer and self.nutrients_adder:
            raise ValueError("pH Reducer and Nutrients Adder cannot be ON simultaneously.")
        return self

class AIOrchestratorOutput(BaseModel):
    status: str = Field(..., pattern='^(GREEN|YELLOW|RED)$', description="System Status")
    priority_action: str = Field(..., description="A single, concise human-readable instruction")
    human_escalation: bool = Field(..., description="Boolean flag to trigger push notifications or emergency alerts")
    
class LoginRequest(BaseModel):
    username: str
    password: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
