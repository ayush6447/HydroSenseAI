from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_type = Column(String)  # xgboost, lstm, yolo, classifier
    input_data = Column(JSON)
    result = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
