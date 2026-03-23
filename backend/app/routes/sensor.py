from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sensor import SensorLogCreate, SensorLogOut
from app.middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/log", response_model=SensorLogOut)
def log_sensor(data: SensorLogCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Save sensor reading to DB
    pass

@router.get("/latest")
def get_latest(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Return latest sensor readings
    pass

@router.get("/history")
def get_history(limit: int = 100, db: Session = Depends(get_db), user=Depends(get_current_user)):
    pass
