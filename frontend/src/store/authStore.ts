import { create } from 'zustand'
interface AuthState { token: string | null; setToken: (t: string) => void; clear: () => void }
export const useAuthStore = create<AuthState>(set => ({
  token: localStorage.getItem('token'),
  setToken: (token) => { localStorage.setItem('token', token); set({ token }) },
  clear: () => { localStorage.removeItem('token'); set({ token: null }) }
}))
