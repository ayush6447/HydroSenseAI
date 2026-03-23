import client from './axiosClient'
export const logSensor = (data: object) => client.post('/sensor/log', data)
export const getLatest = () => client.get('/sensor/latest')
export const getHistory = (limit = 100) => client.get(`/sensor/history?limit=${limit}`)
