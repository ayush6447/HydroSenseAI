from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class SensorLog(Base):
    __tablename__ = "sensor_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ph = Column(Float)
    tds = Column(Float)
    water_level = Column(Float)
    dht_temp = Column(Float)
    dht_humidity = Column(Float)
    water_temp = Column(Float)
    ph_reducer = Column(String)
    add_water = Column(String)
    nutrients_adder = Column(String)
    humidifier = Column(String)
    ex_fan = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
