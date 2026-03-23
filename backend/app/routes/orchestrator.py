"""
POST /api/orchestrate
Runs all 4 AI models and returns a unified prioritized recommendation.

NOTE: Image-based disease detection is intentionally EXCLUDED from this
endpoint. The frontend should call /api/predict/plant-health separately
with a file upload. This avoids multipart/form-data complexity here.
"""
from fastapi import APIRouter, Depends, Query
from app.schemas.predict import OrchestratorRequest, OrchestratorResponse
from app.services.inference_service import inference   # shared singleton
from app.services.recommendation import orchestrate_recommendation
from app.middleware.auth_middleware import get_current_user

router = APIRouter()


@router.post("/", response_model=OrchestratorResponse)
def orchestrate(
    data: OrchestratorRequest,
    debug: bool = Query(default=False, description="Include rendered prompts in response"),
):
    """
    Run all 4 AI models on a single sensor reading and return:
    - Unified GREEN / YELLOW / RED status
    - Single priority action for the farmer
    - All 4 model outputs
    - Actuator command (with 5-min cooldown enforced)
    - Human escalation flag

    Note: YOLOv8 plant health is not called here (requires image upload).
    Use POST /api/predict/plant-health separately for disease detection.
    """
    sensor_dict = data.model_dump()

    # Run all available models (graceful if not trained yet)
    yield_result  = inference.predict_yield(sensor_dict)
    lstm_result   = inference.forecast_next(sensor_dict)
    fault_result  = inference.detect_fault(sensor_dict)

    # YOLOv8 placeholder — not called here (requires image)
    yolo_result = {
        "detected_class": "not_checked",
        "confidence": 0.0,
        "disease": None,
        "note": "Upload image to /api/predict/plant-health for disease detection",
    }

    # Collect validation warnings for transparency
    from app.prompts.validators import validate_sensor_ranges, validate_actuator_logic
    _, range_errors  = validate_sensor_ranges(sensor_dict)
    _, logic_errors  = validate_actuator_logic(sensor_dict)
    warnings = range_errors + logic_errors

    # Cross-model orchestration
    recommendation = orchestrate_recommendation(
        yield_result, lstm_result, yolo_result, fault_result
    )

    response = OrchestratorResponse(
        **recommendation,
        validation_warnings=warnings,
    )

    # Debug mode: attach rendered prompts for development/logging
    if debug:
        response.prompt_context = inference.get_prompt_context(sensor_dict)

    return response
