from datetime import datetime, timedelta
from typing import Optional

OPTIMAL = {
    "ph":           (5.5, 6.5),
    "tds":          (800, 1600),
    "water_level":  (1,   3),
    "dht_temp":     (20,  28),
    "dht_humidity": (50,  80),
    "water_temp":   (18,  24),
}

SENSOR_LABELS = {
    "ph": "pH", "tds": "TDS", "water_level": "Water level",
    "dht_temp": "Air temperature", "dht_humidity": "Air humidity",
    "water_temp": "Water temperature",
}

# In-memory cooldown tracker: {actuator_name: last_trigger_datetime}
_actuator_cooldowns: dict = {}
COOLDOWN_MINUTES = 5


def generate_recommendations(sensor_data: dict) -> list:
    """Generate recommendations for all 6 sensor channels."""
    recs = []
    for field, (lo, hi) in OPTIMAL.items():
        val = sensor_data.get(field)
        if val is None:
            continue
        try:
            val = float(val)
        except (TypeError, ValueError):
            continue
        label = SENSOR_LABELS.get(field, field)
        if val < lo:
            recs.append({
                "type": "warning",
                "field": field,
                "value": val,
                "message": f"{label} is {val} — below optimal minimum {lo}",
            })
        elif val > hi:
            recs.append({
                "type": "warning",
                "field": field,
                "value": val,
                "message": f"{label} is {val} — above optimal maximum {hi}",
            })

    # Water level triggers add_water recommendation
    wl = sensor_data.get("water_level")
    if wl is not None and float(wl) < 1:
        recs.append({
            "type": "action",
            "field": "water_level",
            "value": wl,
            "message": f"Water level critically low ({wl}) — activate add_water pump",
            "actuator": "add_water",
        })

    if not recs:
        recs.append({
            "type": "success",
            "message": "All parameters within optimal range",
        })
    return recs


def _is_on_cooldown(actuator: str) -> bool:
    """Return True if this actuator was triggered less than COOLDOWN_MINUTES ago."""
    last = _actuator_cooldowns.get(actuator)
    if last is None:
        return False
    return datetime.now() - last < timedelta(minutes=COOLDOWN_MINUTES)


def _record_trigger(actuator: str):
    _actuator_cooldowns[actuator] = datetime.now()


def orchestrate_recommendation(yield_result: dict, lstm_result: dict,
                                yolo_result: dict, fault_result: dict) -> dict:
    """
    Cross-model priority logic:
      fault → disease (confidence > 0.80) → out-of-range → forecast warning

    Returns unified status dict with GREEN / YELLOW / RED.
    Enforces 5-minute actuator cooldown to prevent relay hammering.
    """
    status = "GREEN"
    priority_action = "All systems nominal — no action required"
    actuator_to_trigger = None
    escalate = False

    # Priority 1: System fault
    if fault_result.get("is_default") == 1:
        status = "RED"
        priority_action = (
            f"System fault detected (probability "
            f"{fault_result.get('probability', 0):.0%}) — "
            f"check sensor connections and power supply immediately"
        )
        escalate = True

    # Priority 2: Disease (high confidence)
    elif (yolo_result.get("confidence", 0) > 0.80
          and "healthy" not in str(yolo_result.get("detected_class", "")).lower()):
        status = "RED"
        disease = yolo_result.get("detected_class", "unknown disease")
        priority_action = (
            f"Plant disease detected: {disease} "
            f"({yolo_result.get('confidence', 0):.0%} confidence) — "
            f"isolate affected plant and inspect others"
        )
        escalate = True

    # Priority 3: LSTM forecast warning
    elif lstm_result.get("action_needed"):
        status = "YELLOW"
        next_ph = lstm_result.get("ph_predicted", 0)
        if next_ph < 5.5:
            actuator_to_trigger = "ph_reducer"
            priority_action = (
                f"pH trending toward {next_ph} — "
                f"pre-emptively activate pH reducer before it drops below 5.5"
            )
        elif next_ph > 6.5:
            priority_action = f"pH trending toward {next_ph} — check acid dosing system"
        else:
            next_tds = lstm_result.get("tds_predicted", 0)
            if next_tds < 800:
                actuator_to_trigger = "nutrients_adder"
                priority_action = f"TDS trending toward {next_tds} ppm — add nutrients now"
            else:
                priority_action = "Sensor trend warning — monitor closely"

    # Priority 4: Yield score warning
    elif yield_result.get("yield_score") is not None:
        score = yield_result.get("yield_score", 100)
        if score < 40:
            status = "RED"
            priority_action = (
                f"Yield score critically low ({score}/100) — "
                f"check {yield_result.get('primary_issue', 'all sensors')}"
            )
        elif score < 60:
            status = "YELLOW"
            priority_action = (
                f"Yield score low ({score}/100) — "
                f"{yield_result.get('recommendation', 'inspect conditions')}"
            )

    # Apply cooldown to actuator commands
    if actuator_to_trigger and _is_on_cooldown(actuator_to_trigger):
        actuator_to_trigger = None
        priority_action += " (actuator cooldown active — wait before re-triggering)"
    elif actuator_to_trigger:
        _record_trigger(actuator_to_trigger)

    return {
        "status": status,
        "priority_action": priority_action,
        "actuator_to_trigger": actuator_to_trigger,
        "yield_score": yield_result.get("yield_score"),
        "forecast": {
            "ph_predicted": lstm_result.get("ph_predicted"),
            "tds_predicted": lstm_result.get("tds_predicted"),
        },
        "plant_health": {
            "detected_class": yolo_result.get("detected_class"),
            "confidence": yolo_result.get("confidence"),
        },
        "system_fault": {
            "is_default": fault_result.get("is_default", 0),
            "probability": fault_result.get("probability", 0.0),
        },
        "escalate_to_human": escalate,
    }
