"""
PromptService: renders prompt templates with sensor data.
All templates live in backend/app/prompts/ (not ai_models/).
"""
from datetime import datetime
from app.prompts import (
    XGB_SYSTEM_PROMPT, XGB_USER_TEMPLATE,
    LSTM_SYSTEM_PROMPT, LSTM_USER_TEMPLATE, LSTM_COT_TEMPLATE,
    YOLO_SYSTEM_PROMPT, YOLO_USER_TEMPLATE,
    FAULT_SYSTEM_PROMPT, FAULT_USER_TEMPLATE, FAULT_COT_TEMPLATE,
    MASTER_SYSTEM_PROMPT, RECOMMENDATION_CHAIN_PROMPT,
)


class PromptService:

    def render_xgb_prompt(self, sensor_data: dict) -> dict:
        """Render XGBoost yield prediction prompt."""
        active = [k for k in ["ph_reducer", "add_water", "nutrients_adder",
                               "humidifier", "ex_fan"]
                  if sensor_data.get(k) == "ON"]
        return {
            "system": XGB_SYSTEM_PROMPT,
            "user": XGB_USER_TEMPLATE.format(
                ph=sensor_data.get("ph", "N/A"),
                tds=sensor_data.get("tds", "N/A"),
                water_temp=sensor_data.get("water_temp", "N/A"),
                dht_temp=sensor_data.get("dht_temp", "N/A"),
                dht_humidity=sensor_data.get("dht_humidity", "N/A"),
                water_level=sensor_data.get("water_level", "N/A"),
                active_actuators=", ".join(active) if active else "None",
            )
        }

    def render_lstm_prompt(self, sequences: dict) -> dict:
        """Render LSTM forecasting prompt. sequences: dict of field -> list[float]"""
        def fmt(seq):
            return ", ".join(str(round(v, 2)) for v in seq)
        return {
            "system": LSTM_SYSTEM_PROMPT,
            "user": LSTM_USER_TEMPLATE.format(
                ph_sequence=fmt(sequences.get("ph", [])),
                tds_sequence=fmt(sequences.get("tds", [])),
                water_temp_sequence=fmt(sequences.get("water_temp", [])),
                dht_temp_sequence=fmt(sequences.get("dht_temp", [])),
            )
        }

    def render_lstm_cot_prompt(self, ph_sequence: list) -> dict:
        """Render LSTM chain-of-thought prompt for pH analysis."""
        return {
            "system": LSTM_SYSTEM_PROMPT,
            "user": LSTM_COT_TEMPLATE.format(
                ph_sequence=", ".join(str(round(v, 2)) for v in ph_sequence)
            )
        }

    def render_yolo_prompt(self, detected_class: str, confidence: float,
                            sensor_data: dict) -> dict:
        """Render YOLOv8 post-detection prompt."""
        crop = "Tomato"
        if "Pepper" in detected_class:
            crop = "Pepper"
        elif "Potato" in detected_class:
            crop = "Potato"
        return {
            "system": YOLO_SYSTEM_PROMPT,
            "user": YOLO_USER_TEMPLATE.format(
                detected_class=detected_class,
                confidence=round(confidence * 100, 1),
                crop=crop,
                dht_temp=sensor_data.get("dht_temp", "N/A"),
                dht_humidity=sensor_data.get("dht_humidity", "N/A"),
                water_temp=sensor_data.get("water_temp", "N/A"),
            )
        }

    def render_fault_prompt(self, sensor_data: dict,
                             ph_baseline: float = None,
                             tds_baseline: float = None) -> dict:
        """Render fault detection prompt with optional baselines."""
        return {
            "system": FAULT_SYSTEM_PROMPT,
            "user": FAULT_USER_TEMPLATE.format(
                **{k: sensor_data.get(k, "N/A") for k in
                   ["ph", "tds", "water_level", "dht_temp", "dht_humidity",
                    "water_temp", "ph_reducer", "add_water", "nutrients_adder",
                    "humidifier", "ex_fan"]},
                ph_baseline=round(ph_baseline, 2) if ph_baseline else "unknown",
                tds_baseline=round(tds_baseline, 1) if tds_baseline else "unknown",
            )
        }

    def render_fault_cot_prompt(self, sensor_data: dict) -> dict:
        """Render fault chain-of-thought analysis prompt."""
        return {
            "system": FAULT_SYSTEM_PROMPT,
            "user": FAULT_COT_TEMPLATE.format(
                **{k: sensor_data.get(k, "N/A") for k in
                   ["ph", "tds", "water_level", "dht_temp", "dht_humidity",
                    "water_temp", "ph_reducer", "add_water", "nutrients_adder",
                    "humidifier", "ex_fan"]}
            )
        }

    def render_orchestrator_prompt(self, yield_result: dict, lstm_result: dict,
                                    yolo_result: dict, fault_result: dict,
                                    last_action: str = "None",
                                    last_action_time: str = "Never") -> dict:
        """Render cross-model orchestration prompt."""
        return {
            "system": MASTER_SYSTEM_PROMPT,
            "user": RECOMMENDATION_CHAIN_PROMPT.format(
                yield_score=yield_result.get("yield_score", "N/A"),
                primary_issue=yield_result.get("primary_issue", "none"),
                next_ph=lstm_result.get("ph_predicted", "N/A"),
                next_tds=lstm_result.get("tds_predicted", "N/A"),
                lstm_action=lstm_result.get("action_needed", False),
                detected_class=yolo_result.get("detected_class", "unknown"),
                yolo_confidence=round(yolo_result.get("confidence", 0) * 100, 1),
                is_default=fault_result.get("is_default", 0),
                fault_probability=fault_result.get("probability", 0.0),
                timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                last_action=last_action,
                last_action_time=last_action_time,
            )
        }
