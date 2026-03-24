import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
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
