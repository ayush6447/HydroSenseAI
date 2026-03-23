import client from './axiosClient'
export const login = (email: string, password: string) => client.post('/auth/login', { email, password })
export const register = (email: string, password: string) => client.post('/auth/register', { email, password })
