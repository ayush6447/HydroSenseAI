import client from './axiosClient'
export const predictYield = (features: object) => client.post('/predict/yield', { features })
export const forecastPh = (features: object) => client.post('/predict/forecast', { features })
export const detectDisease = (file: File) => {
  const form = new FormData(); form.append('file', file)
  return client.post('/predict/plant-health', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const detectFault = (features: object) => client.post('/predict/fault-detection', { features })
