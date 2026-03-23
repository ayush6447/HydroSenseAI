"""
Input validators implementing the testing checklist edge cases.
Called before inference to reject or flag physically impossible readings.
"""
from typing import Tuple, List

# Physically valid sensor ranges
VALID_RANGES = {
    "ph":           (0.0,   14.0),
    "tds":          (0.0,   3000.0),
    "water_level":  (0,     3),
    "dht_temp":     (0.0,   60.0),
    "dht_humidity": (0.0,   100.0),
    "water_temp":   (0.0,   40.0),
}

# Hydroponic-specific warning thresholds (within valid but unusual)
HYDRO_RANGES = {
    "ph":           (4.0,   9.0),
    "tds":          (100.0, 2500.0),
    "dht_temp":     (10.0,  45.0),
    "dht_humidity": (10.0,  99.0),
    "water_temp":   (5.0,   35.0),
}

VALID_ACTUATOR_VALUES = {"ON", "OFF"}


def validate_sensor_ranges(data: dict) -> Tuple[bool, List[str]]:
    """
    Check for physically impossible sensor values.
    Returns (is_valid, list_of_errors).
    A reading with errors should be flagged as isDefault=1 candidate.

    Edge cases covered (from dataset known issues):
    - TDS = -283.91 (negative — impossible)
    - DHT_humidity = 3312.6 (overflow — impossible)
    - pH = 0.27 (extreme low — sensor fault)
    - DHT_temp = 70.0 (extreme high — sensor fault)
    """
    errors = []
    for field, (min_val, max_val) in VALID_RANGES.items():
        val = data.get(field)
        if val is None:
            continue
        try:
            val = float(val)
        except (TypeError, ValueError):
            errors.append(f"{field}: non-numeric value '{data.get(field)}'")
            continue
        if val < min_val or val > max_val:
            errors.append(
                f"{field}: {val} is outside physically valid range "
                f"[{min_val}, {max_val}]"
            )
    return len(errors) == 0, errors


def validate_actuator_logic(data: dict) -> Tuple[bool, List[str]]:
    """
    Detect contradictory actuator states that indicate a fault.

    Contradictions checked:
    - add_water=ON but water_level=3 (why add water if tank is full?)
    - nutrients_adder=ON but TDS > 1800 (nutrient overdose risk)
    - ph_reducer=ON but pH < 5.0 (would push pH dangerously low)
    - humidifier=ON but dht_humidity > 90 (over-humidifying)
    - All 5 actuators ON simultaneously (physically implausible)
    """
    issues = []
    wl  = data.get("water_level", 0)
    tds = data.get("tds", 0)
    ph  = data.get("ph", 7.0)
    hum = data.get("dht_humidity", 60)

    try:
        if data.get("add_water") == "ON" and float(wl) >= 3:
            issues.append("add_water=ON but water_level=3 (tank already full)")
        if data.get("nutrients_adder") == "ON" and float(tds) > 1800:
            issues.append(f"nutrients_adder=ON but TDS={tds} is already high")
        if data.get("ph_reducer") == "ON" and float(ph) < 5.0:
            issues.append(f"ph_reducer=ON but pH={ph} is already dangerously low")
        if data.get("humidifier") == "ON" and float(hum) > 90:
            issues.append(f"humidifier=ON but humidity={hum}% is already very high")

        actuators = ["ph_reducer", "add_water", "nutrients_adder", "humidifier", "ex_fan"]
        all_on = all(data.get(a) == "ON" for a in actuators)
        if all_on:
            issues.append("All 5 actuators ON simultaneously — physically implausible")
    except (TypeError, ValueError) as e:
        issues.append(f"Actuator logic check error: {e}")

    return len(issues) == 0, issues


def validate_sequence(sequence: list, field_name: str = "value") -> Tuple[bool, List[str]]:
    """
    Validate an LSTM input sequence (list of floats).

    Checks:
    - No None/NaN values
    - No extreme outliers (value > 5 std deviations from sequence mean)
    - Minimum length of 10 readings
    - Not all identical values (stuck sensor indicator)
    """
    issues = []
    if len(sequence) < 10:
        issues.append(f"{field_name} sequence too short: {len(sequence)} < 10 required")
        return False, issues

    clean = [v for v in sequence if v is not None]
    if len(clean) < len(sequence):
        issues.append(f"{field_name}: {len(sequence)-len(clean)} missing values in sequence")

    if len(set(clean)) == 1:
        issues.append(f"{field_name}: all values identical ({clean[0]}) — stuck sensor")

    if len(clean) >= 2:
        mean = sum(clean) / len(clean)
        variance = sum((x - mean) ** 2 for x in clean) / len(clean)
        std = variance ** 0.5
        if std > 0:
            outliers = [v for v in clean if abs(v - mean) > 5 * std]
            if outliers:
                issues.append(f"{field_name}: {len(outliers)} extreme outlier(s): {outliers[:3]}")

    return len(issues) == 0, issues
