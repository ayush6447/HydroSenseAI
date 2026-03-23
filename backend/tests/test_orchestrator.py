import pytest
from app.services.recommendation import orchestrate_recommendation, _actuator_cooldowns
from app.services.inference_service import inference

NORMAL_YIELD  = {"yield_score": 84, "primary_issue": None, "severity": "none"}
NORMAL_LSTM   = {"ph_predicted": 5.9, "tds_predicted": 1150, "action_needed": False}
NORMAL_YOLO   = {"detected_class": "Tomato_healthy", "confidence": 0.97}
NORMAL_FAULT  = {"is_default": 0, "probability": 0.02}


# ── Status classification ─────────────────────────────────────────

def test_all_normal_is_green():
    r = orchestrate_recommendation(NORMAL_YIELD, NORMAL_LSTM, NORMAL_YOLO, NORMAL_FAULT)
    assert r["status"] == "GREEN"


def test_fault_triggers_red():
    r = orchestrate_recommendation(
        NORMAL_YIELD, NORMAL_LSTM, NORMAL_YOLO,
        {"is_default": 1, "probability": 0.95}
    )
    assert r["status"] == "RED"
    assert r["escalate_to_human"] is True


def test_disease_high_confidence_triggers_red():
    r = orchestrate_recommendation(
        NORMAL_YIELD, NORMAL_LSTM,
        {"detected_class": "Tomato_Late_blight", "confidence": 0.91},
        NORMAL_FAULT
    )
    assert r["status"] == "RED"
    assert r["escalate_to_human"] is True


def test_disease_low_confidence_not_red():
    r = orchestrate_recommendation(
        NORMAL_YIELD, NORMAL_LSTM,
        {"detected_class": "Tomato_Late_blight", "confidence": 0.55},
        NORMAL_FAULT
    )
    assert r["status"] != "RED"


def test_lstm_warning_triggers_yellow():
    r = orchestrate_recommendation(
        NORMAL_YIELD,
        {"ph_predicted": 5.1, "tds_predicted": 1100, "action_needed": True},
        NORMAL_YOLO, NORMAL_FAULT
    )
    assert r["status"] in ["YELLOW", "RED"]


def test_low_yield_score_triggers_yellow():
    r = orchestrate_recommendation(
        {"yield_score": 45, "primary_issue": "tds", "severity": "high"},
        NORMAL_LSTM, NORMAL_YOLO, NORMAL_FAULT
    )
    assert r["status"] in ["YELLOW", "RED"]


def test_very_low_yield_score_triggers_red():
    r = orchestrate_recommendation(
        {"yield_score": 15, "primary_issue": "ph", "severity": "high"},
        NORMAL_LSTM, NORMAL_YOLO, NORMAL_FAULT
    )
    assert r["status"] == "RED"


# ── Priority order ────────────────────────────────────────────────

def test_fault_overrides_disease():
    r = orchestrate_recommendation(
        NORMAL_YIELD, NORMAL_LSTM,
        {"detected_class": "Tomato_Late_blight", "confidence": 0.91},
        {"is_default": 1, "probability": 0.95}
    )
    assert "fault" in r["priority_action"].lower()


def test_disease_overrides_yield_warning():
    r = orchestrate_recommendation(
        {"yield_score": 35, "primary_issue": "tds", "severity": "high"},
        NORMAL_LSTM,
        {"detected_class": "Tomato_Late_blight", "confidence": 0.91},
        NORMAL_FAULT
    )
    assert "disease" in r["priority_action"].lower() or "blight" in r["priority_action"].lower()


# ── Cooldown enforcement ──────────────────────────────────────────

def test_actuator_cooldown_prevents_repeat():
    _actuator_cooldowns.clear()   # reset state
    lstm_warn = {"ph_predicted": 5.1, "tds_predicted": 1100, "action_needed": True}
    r1 = orchestrate_recommendation(NORMAL_YIELD, lstm_warn, NORMAL_YOLO, NORMAL_FAULT)
    r2 = orchestrate_recommendation(NORMAL_YIELD, lstm_warn, NORMAL_YOLO, NORMAL_FAULT)
    # Second call should suppress the actuator due to cooldown
    if r1["actuator_to_trigger"]:
        assert r2["actuator_to_trigger"] is None
        assert "cooldown" in r2["priority_action"].lower()


# ── Response format ───────────────────────────────────────────────

def test_response_has_all_required_fields():
    r = orchestrate_recommendation(NORMAL_YIELD, NORMAL_LSTM, NORMAL_YOLO, NORMAL_FAULT)
    for field in ["status", "priority_action", "actuator_to_trigger",
                  "yield_score", "forecast", "plant_health", "system_fault",
                  "escalate_to_human"]:
        assert field in r, f"Missing field: {field}"


# ── Graceful degradation (no trained models) ──────────────────────

def test_inference_service_without_models():
    """InferenceService must not raise even if no model files exist."""
    result = inference.predict_yield({
        "ph": 5.9, "tds": 1148, "water_level": 2,
        "dht_temp": 24.3, "dht_humidity": 63.4, "water_temp": 21.5,
        "ph_reducer": "OFF", "add_water": "OFF",
        "nutrients_adder": "OFF", "humidifier": "OFF", "ex_fan": "OFF"
    })
    assert "yield_score" in result
    assert result["yield_score"] is not None or "validation_errors" in result
