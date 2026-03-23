import client from './axiosClient';
export const predictYield = (features) => client.post('/predict/yield', { features });
export const forecastPh = (features) => client.post('/predict/forecast', { features });
export const detectDisease = (file) => {
    const form = new FormData();
    form.append('file', file);
    return client.post('/predict/plant-health', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const detectFault = (features) => client.post('/predict/fault-detection', { features });
