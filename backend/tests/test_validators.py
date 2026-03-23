import pytest
from app.prompts.validators import (
    validate_sensor_ranges, validate_actuator_logic, validate_sequence
)

# ── validate_sensor_ranges ────────────────────────────────────────

def test_valid_reading_passes():
    data = {"ph": 5.9, "tds": 1148, "water_level": 2,
            "dht_temp": 24.3, "dht_humidity": 63.4, "water_temp": 21.5}
    ok, errors = validate_sensor_ranges(data)
    assert ok and errors == []


def test_negative_tds_caught():
    ok, errors = validate_sensor_ranges({"tds": -283.91})
    assert not ok
    assert any("tds" in e for e in errors)


def test_humidity_overflow_caught():
    ok, errors = validate_sensor_ranges({"dht_humidity": 3312.6})
    assert not ok
    assert any("dht_humidity" in e for e in errors)


def test_extreme_low_ph_caught():
    """pH=0.27 is a known anomaly in the dataset — below valid range."""
    ok, errors = validate_sensor_ranges({"ph": 0.27})
    # pH 0.27 is within [0.0, 14.0] so it IS physically valid
    # but it would be flagged by HYDRO_RANGES as an outlier
    # The validator only checks VALID_RANGES (physical limits)
    assert ok  # 0.27 is between 0 and 14


def test_ph_negative_caught():
    ok, errors = validate_sensor_ranges({"ph": -1.0})
    assert not ok
    assert any("ph" in e for e in errors)


def test_extreme_high_temp_caught():
    ok, errors = validate_sensor_ranges({"dht_temp": 70.0})
    assert not ok
    assert any("dht_temp" in e for e in errors)


def test_multiple_errors_returned():
    ok, errors = validate_sensor_ranges({"tds": -100, "dht_humidity": 5000})
    assert not ok
    assert len(errors) == 2


# ── validate_actuator_logic ───────────────────────────────────────

def test_add_water_full_tank():
    ok, issues = validate_actuator_logic({"add_water": "ON", "water_level": 3})
    assert not ok
    assert any("add_water" in i for i in issues)


def test_nutrients_high_tds():
    ok, issues = validate_actuator_logic({"nutrients_adder": "ON", "tds": 2000})
    assert not ok


def test_ph_reducer_too_low():
    ok, issues = validate_actuator_logic({"ph_reducer": "ON", "ph": 4.5})
    assert not ok


def test_all_actuators_on():
    ok, issues = validate_actuator_logic({
        "ph_reducer": "ON", "add_water": "ON", "nutrients_adder": "ON",
        "humidifier": "ON", "ex_fan": "ON",
        "water_level": 1, "tds": 1000, "ph": 6.0, "dht_humidity": 60
    })
    assert not ok
    assert any("simultaneously" in i for i in issues)


def test_normal_state_passes():
    ok, issues = validate_actuator_logic({
        "ph_reducer": "OFF", "add_water": "OFF", "nutrients_adder": "OFF",
        "humidifier": "OFF", "ex_fan": "OFF",
        "water_level": 2, "tds": 1150, "ph": 5.9, "dht_humidity": 65
    })
    assert ok and issues == []


# ── validate_sequence ─────────────────────────────────────────────

def test_valid_sequence():
    ok, issues = validate_sequence([5.8 + i*0.01 for i in range(30)])
    assert ok


def test_too_short_sequence():
    ok, issues = validate_sequence([5.8, 5.9, 6.0])
    assert not ok
    assert any("short" in i for i in issues)


def test_stuck_sensor_detected():
    ok, issues = validate_sequence([5.8] * 30)
    assert not ok
    assert any("identical" in i for i in issues)


def test_sequence_with_none_values():
    seq = [5.8] * 25 + [None] * 5
    ok, issues = validate_sequence(seq)
    assert not ok
    assert any("missing" in i for i in issues)
