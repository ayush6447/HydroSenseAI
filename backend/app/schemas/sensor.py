from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SensorLogCreate(BaseModel):
    ph: float
    tds: float
    water_level: float
    dht_temp: float
    dht_humidity: float
    water_temp: float
    ph_reducer: str = "OFF"
    add_water: Optional[str] = "OFF"
    nutrients_adder: str = "OFF"
    humidifier: str = "OFF"
    ex_fan: str = "OFF"

class SensorLogOut(SensorLogCreate):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True
