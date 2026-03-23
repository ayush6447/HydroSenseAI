from fastapi import APIRouter, Depends, UploadFile, File
from app.services.inference_service import inference   # shared singleton
from app.middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/yield")
def predict_yield(data: dict, user=Depends(get_current_user)):
    return inference.predict_yield(data)

@router.post("/forecast")
def forecast_ph_tds(data: dict, user=Depends(get_current_user)):
    return inference.forecast_next(data)

@router.post("/plant-health")
async def detect_plant_health(file: UploadFile = File(...)):
    return await inference.detect_disease(file)

@router.post("/fault-detection")
def detect_fault(data: dict, user=Depends(get_current_user)):
    return inference.detect_fault(data)
