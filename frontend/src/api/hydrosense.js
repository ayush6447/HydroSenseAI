import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000/api';
export const submitSensors = async (sensorData) => {
    try {
        const res = await axios.post(`${API_BASE}/orchestrate`, sensorData);
        return res.data;
    }
    catch (error) {
        console.error("Orchestrator API Error", error);
        throw error;
    }
};
