"""
isDefault Fault Classifier — Prompt Templates

System, user, synthetic fault generation, and chain-of-thought prompts.
All templates use {variable} placeholders for .format(**kwargs) substitution.
"""

FAULT_SYSTEM_PROMPT = """You are a fault detection AI for a hydroponic IoT
monitoring system. You analyze real-time sensor and actuator data to determine
whether the system is in a normal or abnormal "default" state.

The isDefault label (1=fault, 0=normal) indicates when the system reverted to
fallback settings due to sensor errors, connectivity loss, or hardware failure.

IMPORTANT:
- Only 1.78% of readings are faults (900 out of 50,570 rows in training data)
- A false negative (missed fault) is MORE DANGEROUS than a false positive
- Flag as fault if probability > 0.20 (low threshold = high sensitivity)
- Provide a plain-language explanation of WHY you think it is a fault

When classifying a reading, check for:
1. Physically impossible values (negative TDS, humidity > 100%)
2. Sudden large deviations from recent baseline
3. Contradictory actuator states (add_water=ON but water_level=3)
4. Fault probability > 0.20 triggers a fault report"""

FAULT_USER_TEMPLATE = """Evaluate this sensor reading for anomalies:

Current reading:
- pH: {ph}
- TDS: {tds} ppm
- Water level: {water_level}/3
- Air temp: {dht_temp}C
- Air humidity: {dht_humidity}%
- Water temp: {water_temp}C
- pH_reducer: {ph_reducer}
- add_water: {add_water}
- nutrients_adder: {nutrients_adder}
- humidifier: {humidifier}
- ex_fan: {ex_fan}

Recent baseline (last 10 readings average):
- pH avg: {ph_baseline}
- TDS avg: {tds_baseline}

Respond with:
1. Classification: NORMAL or FAULT
2. Fault probability: 0.0-1.0
3. Which sensor/actuator triggered the fault suspicion?
4. What likely caused this fault?
5. What action should I take?"""

FAULT_SYNTHETIC_PROMPT = """Generate 10 realistic fault scenarios to augment
training data for the hydroponic IoT fault classifier.

The real dataset has only 900 fault examples (1.78% of 50,570 rows).

For each scenario provide sensor values, reason isDefault=1, and primary fault indicator.

Cover these fault types:
1. pH sensor disconnection (returns 0.0 or 7.0 exactly)
2. TDS sensor malfunction (returns 0 or negative)
3. Water pump failure (water_level drops but add_water=ON continuously)
4. Humidity sensor overflow (DHT_humidity > 100%)
5. Temperature spike (DHT_temp > 50C briefly)
6. Nutrient depletion (TDS drops 400+ ppm in one reading)
7. Power fluctuation (multiple sensors return exact same value)
8. Network dropout recovery (all sensors return last known value 5+ min)
9. pH controller runaway (pH < 4.0 despite ph_reducer=OFF)
10. Float sensor stuck (water_level=3 always even during pump cycles)

Respond as a JSON array of 10 fault records matching the dataset schema:
[{{"ph": <float>, "tds": <float>, "water_level": <int>,
   "dht_temp": <float>, "dht_humidity": <float>, "water_temp": <float>,
   "ph_reducer": "ON|OFF", "add_water": "ON|OFF",
   "nutrients_adder": "ON|OFF", "humidifier": "ON|OFF", "ex_fan": "ON|OFF",
   "isDefault": 1, "fault_type": "<string>", "primary_indicator": "<sensor>"}}]"""

FAULT_COT_TEMPLATE = """Analyze this hydroponic sensor reading step by step.

Reading: pH={ph}, TDS={tds}, water_level={water_level},
DHT_temp={dht_temp}, DHT_humidity={dht_humidity}, water_temp={water_temp},
pH_reducer={ph_reducer}, add_water={add_water},
nutrients_adder={nutrients_adder}, humidifier={humidifier}, ex_fan={ex_fan}

Step 1 - RANGE CHECK: Are any values physically impossible?
  (Negative TDS? Humidity > 100%? pH < 0 or > 14? Temp > 50C?)

Step 2 - LOGIC CHECK: Are any actuator states contradictory?
  (add_water=ON but water_level=3? nutrients_adder=ON but TDS already high?)

Step 3 - OUTLIER CHECK: Are any values extreme outliers?
  (pH outside 4-9? TDS outside 100-2000? Humidity > 95%?)

Step 4 - PATTERN CHECK: Does the combination make physical sense?
  (If water_temp=0 that is impossible in a running system)

Step 5 - FINAL VERDICT:

Conclude with:
VERDICT: FAULT / NORMAL
PROBABILITY: {{0.0-1.0}}
REASON: {{one sentence}}
ACTION: {{what to check or do}}"""
