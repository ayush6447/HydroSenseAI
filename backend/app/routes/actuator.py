from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/control")
def control_actuator(command: dict, user=Depends(get_current_user)):
    # Send ON/OFF command to actuator
    return {"status": "command_sent", "actuator": command.get("name"), "state": command.get("state")}
