import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';


const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const login = async () => {
  const response = await api.post('/api/auth/login', {
    username: 'farmer',
    password: 'password',
  });
  return response.data.access_token;
};

export const fetchSensorData = async (token: string) => {
  const response = await api.get('/api/sensor', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchOrchestrationData = async (token: string) => {
  const response = await api.post('/api/orchestrate', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const resetActuators = async (token: string) => {
  const response = await api.post('/api/actuators/reset', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const isolateSystem = async (token: string) => {
  const response = await api.post('/api/actuators/isolate', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
