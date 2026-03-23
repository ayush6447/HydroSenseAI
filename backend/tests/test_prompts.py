import pytest
from app.prompts import (
    XGB_USER_TEMPLATE, LSTM_USER_TEMPLATE,
    YOLO_USER_TEMPLATE, FAULT_USER_TEMPLATE, RECOMMENDATION_CHAIN_PROMPT
)
from app.services.prompt_service import PromptService

SAMPLE = {
    "ph": 5.9, "tds": 1148, "water_level": 2,
    "dht_temp": 24.3, "dht_humidity": 63.4, "water_temp": 21.5,
    "ph_reducer": "OFF", "add_water": "OFF",
    "nutrients_adder": "OFF", "humidifier": "OFF", "ex_fan": "OFF",
}

ps = PromptService()


def test_xgb_prompt_renders():
    result = ps.render_xgb_prompt(SAMPLE)
    assert "system" in result and "user" in result
    assert str(SAMPLE["ph"]) in result["user"]
    assert str(SAMPLE["tds"]) in result["user"]


def test_lstm_prompt_renders():
    seqs = {"ph": [5.9]*30, "tds": [1148]*30,
            "water_temp": [21.5]*30, "dht_temp": [24.3]*30}
    result = ps.render_lstm_prompt(seqs)
    assert "system" in result and "user" in result
    assert "5.9" in result["user"]


def test_yolo_prompt_renders():
    result = ps.render_yolo_prompt("Tomato_Late_blight", 0.91, SAMPLE)
    assert "Tomato_Late_blight" in result["user"]
    assert "91.0" in result["user"]


def test_fault_prompt_renders():
    result = ps.render_fault_prompt(SAMPLE, ph_baseline=5.8, tds_baseline=1100)
    assert str(SAMPLE["ph"]) in result["user"]
    assert "5.8" in result["user"]   # baseline present


def test_orchestrator_prompt_renders():
    result = ps.render_orchestrator_prompt(
        yield_result={"yield_score": 84, "primary_issue": None},
        lstm_result={"ph_predicted": 5.8, "tds_predicted": 1150, "action_needed": False},
        yolo_result={"detected_class": "Tomato_healthy", "confidence": 0.97},
        fault_result={"is_default": 0, "probability": 0.02},
    )
    assert "84" in result["user"]
    assert "5.8" in result["user"]


def test_no_key_error_on_all_templates():
    """Verify no KeyError when all fields are provided."""
    for render_fn, kwargs in [
        (ps.render_xgb_prompt,   {"sensor_data": SAMPLE}),
        (ps.render_fault_prompt, {"sensor_data": SAMPLE}),
    ]:
        result = render_fn(**kwargs)
        assert isinstance(result["user"], str)
