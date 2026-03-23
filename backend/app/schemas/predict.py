from pydantic import BaseModel, Field
from typing import Any, Dict, Optional, List


class PredictRequest(BaseModel):
    features: Dict[str, Any]


class PredictResponse(BaseModel):
    model: str
    result: Any
    confidence: Optional[float] = None
    recommendation: Optional[str] = None


class OrchestratorRequest(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0)
    tds: float = Field(..., ge=-500.0)       # allow slightly negative (known sensor fault)
    water_level: int = Field(..., ge=0, le=3)
    dht_temp: float = Field(..., ge=-20.0, le=100.0)
    dht_humidity: float = Field(..., ge=0.0, le=5000.0)  # allow overflow values — validator flags them
    water_temp: float = Field(..., ge=-10.0, le=100.0)
    ph_reducer: str = Field(default="OFF", pattern="^(ON|OFF)$")
    add_water: Optional[str] = Field(default="OFF", pattern="^(ON|OFF)$")
    nutrients_adder: str = Field(default="OFF", pattern="^(ON|OFF)$")
    humidifier: str = Field(default="OFF", pattern="^(ON|OFF)$")
    ex_fan: str = Field(default="OFF", pattern="^(ON|OFF)$")


class ValidationError(BaseModel):
    field: str
    value: Any
    error: str


class OrchestratorResponse(BaseModel):
    status: str                             # GREEN / YELLOW / RED
    priority_action: str
    actuator_to_trigger: Optional[str]
    yield_score: Optional[float]
    forecast: Dict[str, Any]
    plant_health: Dict[str, Any]
    system_fault: Dict[str, Any]
    escalate_to_human: bool
    validation_warnings: List[str] = []
    prompt_context: Optional[Dict] = None  # only populated in debug mode
