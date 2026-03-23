import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

let cachedToken: string | null = null;

const getAuthToken = async () => {
  if (cachedToken) return cachedToken;
  const credentials = { email: "test@hydrosense.ai", password: "password123" };
  
  try {
    // Try to register first, catch error if user already exists
    await axios.post(`${API_BASE}/auth/register`, credentials).catch(() => {});
    
    // Login to acquire token
    const res = await axios.post(`${API_BASE}/auth/login`, credentials);
    cachedToken = res.data.access_token;
    return cachedToken;
  } catch (err) {
    console.error("Auto-Auth failed:", err);
    return null;
  }
};

export const submitSensors = async (sensorData: any) => {
  const token = await getAuthToken();
  try {
    const res = await axios.post(`${API_BASE}/orchestrate/`, sensorData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Orchestrator API Error", error);
    throw error;
  }
};

export const uploadPlantImage = async (file: File) => {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const res = await axios.post(`${API_BASE}/predict/plant-health`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" 
      }
    });
    return res.data;
  } catch (error) {
    console.error("YOLOv8 API Error", error);
    throw error;
  }
};
