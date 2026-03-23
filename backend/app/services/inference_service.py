import pickle
import torch
import numpy as np
from pathlib import Path
from typing import Optional
from app.config import settings
from app.prompts.validators import validate_sensor_ranges, validate_actuator_logic

OPTIMAL = {
    "ph":           (5.5, 6.5),
    "tds":          (800, 1600),
    "water_level":  (1,   3),
    "dht_temp":     (20,  28),
    "dht_humidity": (50,  80),
    "water_temp":   (18,  24),
}

FEATURE_COLS = [
    "ph", "tds", "water_level", "dht_temp", "dht_humidity",
    "water_temp", "ph_reducer", "add_water", "nutrients_adder",
    "humidifier", "ex_fan"
]


class InferenceService:
    def __init__(self):
        self.model_dir = Path(settings.model_dir)
        self._xgb = None
        self._lstm = None
        self._yolo = None
        self._classifier = None

    # ── Lazy model loaders (graceful if file missing) ─────────────
    @property
    def xgb(self):
        if self._xgb is None:
            path = self.model_dir / "xgboost_yield.pkl"
            if path.exists():
                with open(path, "rb") as f:
                    self._xgb = pickle.load(f)
        return self._xgb

    @property
    def classifier(self):
        if self._classifier is None:
            path = self.model_dir / "classifier_isdefault.pkl"
            if path.exists():
                with open(path, "rb") as f:
                    self._classifier = pickle.load(f)
        return self._classifier

    @property
    def lstm(self):
        if self._lstm is None:
            path = self.model_dir / "lstm_forecast.pt"
            if path.exists():
                try:
                    from app.ml.lstm_model import LSTMForecaster
                    model = LSTMForecaster()
                    model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
                    model.eval()
                    self._lstm = model
                except Exception as e:
                    print(f"LSTM load error: {e}")
        return self._lstm

    @property
    def yolo(self):
        if self._yolo is None:
            path = self.model_dir / "yolov8_plant.pt"
            if path.exists():
                try:
                    from ultralytics import YOLO
                    self._yolo = YOLO(path)
                except ImportError:
                    print("Ultralytics not installed, cannot load YOLO")
        return self._yolo

    # ── Feature extraction ────────────────────────────────────────
    def _extract_features(self, data: dict) -> list:
        enc = {"ON": 1.0, "OFF": 0.0}
        features = []
        for c in FEATURE_COLS:
            val = data.get(c, 0)
            if str(val) in enc:
                features.append(enc[str(val)])
            else:
                features.append(float(val))
        return features

    def _find_primary_issue(self, data: dict) -> tuple:
        """Returns (primary_issue_field, severity)."""
        worst_field = None
        worst_ratio = 0.0
        for field, (lo, hi) in OPTIMAL.items():
            val = data.get(field)
            if val is None:
                continue
            try:
                val = float(val)
            except (TypeError, ValueError):
                continue
            mid = (lo + hi) / 2
            span = (hi - lo) / 2
            if span > 0:
                ratio = abs(val - mid) / span
                if ratio > worst_ratio:
                    worst_ratio = ratio
                    worst_field = field

        if worst_ratio == 0:
            severity = "none"
        elif worst_ratio < 0.5:
            severity = "low"
        elif worst_ratio < 1.0:
            severity = "medium"
        else:
            severity = "high"

        return worst_field, severity

    # ── Inference methods ─────────────────────────────────────────
    def predict_yield(self, data: dict) -> dict:
        is_valid, errors = validate_sensor_ranges(data)
        primary_issue, severity = self._find_primary_issue(data)

        if not is_valid:
            return {
                "yield_score": None,
                "primary_issue": primary_issue,
                "severity": "high",
                "recommendation": f"Sensor fault detected: {'; '.join(errors)}",
                "validation_errors": errors,
            }

        if self.xgb is None:
            score = self._rule_based_yield(data)
        else:
            features = self._extract_features(data)
            score = float(self.xgb.predict([features])[0])

        return {
            "yield_score": round(score, 2),
            "primary_issue": primary_issue,
            "severity": severity,
            "recommendation": self._yield_recommendation(score, primary_issue),
        }

    def forecast_next(self, data: dict) -> dict:
        if self.lstm is None:
            ph = float(data.get("ph", 6.0))
            tds = float(data.get("tds", 1000))
            action = ph < 5.5 or ph > 6.5 or tds < 800 or tds > 1600
            return {
                "ph_predicted": round(ph, 2),
                "tds_predicted": round(tds, 0),
                "action_needed": action,
                "model_status": "placeholder",
            }
        
        # Build tensor without scaling (training used raw values)
        # We duplicate the single reading 30 times as a memory fallback since we lack DB context here
        raw_seq = [float(data.get(c, 0)) for c in ['ph','tds','water_temp','dht_temp','dht_humidity','water_level']]
        sequence = [raw_seq for _ in range(30)]
        tensor_in = torch.tensor([sequence], dtype=torch.float32)
        with torch.no_grad():
            preds = self.lstm(tensor_in).numpy()[0]
        
        ph_pred, tds_pred = float(preds[0]), float(preds[1])
        action = ph_pred < 5.5 or ph_pred > 6.5 or tds_pred < 800 or tds_pred > 1600
        return {
            "ph_predicted": round(ph_pred, 2),
            "tds_predicted": round(tds_pred, 0),
            "action_needed": action,
            "model_status": "trained",
        }

    async def detect_disease(self, file) -> dict:
        if self.yolo is None:
            return {
                "detected_class": "unknown",
                "confidence": 0.0,
                "disease": None,
                "model_status": "placeholder",
            }
        
        from PIL import Image
        import io
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        res = self.yolo(image)
        cls_idx = res[0].probs.top1
        conf = float(res[0].probs.top1conf)
        class_name = res[0].names[cls_idx]
        return {
            "detected_class": class_name,
            "confidence": round(conf, 4),
            "disease": class_name if "healthy" not in class_name.lower() else None,
            "model_status": "trained",
        }

    def detect_fault(self, data: dict) -> dict:
        is_valid, range_errors = validate_sensor_ranges(data)
        _, logic_errors = validate_actuator_logic(data)

        # Rule-based fault if validation fails (even without trained model)
        if not is_valid or logic_errors:
            all_errors = range_errors + logic_errors
            return {
                "is_default": 1,
                "probability": 0.95,
                "status": "fault",
                "reason": "; ".join(all_errors),
            }

        if self.classifier is None:
            return {"is_default": 0, "probability": 0.0,
                    "status": "normal", "model_status": "placeholder"}

        features = self._extract_features(data)
        prob = float(self.classifier.predict_proba([features])[0][1])
        return {
            "is_default": 1 if prob > 0.20 else 0,
            "probability": round(prob, 4),
            "status": "fault" if prob > 0.20 else "normal",
        }

    def get_prompt_context(self, data: dict) -> dict:
        """Return rendered prompt context alongside predictions (for debugging/logging)."""
        from app.services.prompt_service import PromptService
        ps = PromptService()
        return {
            "xgb_prompt":   ps.render_xgb_prompt(data),
            "fault_prompt": ps.render_fault_prompt(data),
        }

    # ── Helpers ───────────────────────────────────────────────────
    def _rule_based_yield(self, data: dict) -> float:
        """Simple rule-based yield score when XGBoost model is not yet trained."""
        score = 100.0
        for field, (lo, hi) in OPTIMAL.items():
            val = data.get(field)
            if val is None:
                continue
            try:
                val = float(val)
            except (TypeError, ValueError):
                continue
            if val < lo:
                score -= min(30, (lo - val) / lo * 50)
            elif val > hi:
                score -= min(30, (val - hi) / hi * 50)
        return max(0.0, min(100.0, score))

    def _yield_recommendation(self, score: float,
                               primary_issue: Optional[str]) -> str:
        if score >= 80:
            return "Optimal growing conditions"
        if primary_issue == "ph":
            return "pH is out of range — check pH reducer and buffer solution"
        if primary_issue == "tds":
            return "TDS out of range — check nutrient concentration"
        if primary_issue == "water_level":
            return "Water level low — top up reservoir"
        if score >= 60:
            return "Minor deviation detected — monitor closely for 30 minutes"
        return "Immediate attention needed — check all sensor readings"


# ── Module-level singleton (import this, do not instantiate again) ──
inference = InferenceService()
