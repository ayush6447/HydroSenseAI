import { create } from 'zustand'
import type { SensorReading } from '../types/sensor'
interface SensorState { latest: SensorReading | null; setLatest: (d: SensorReading) => void }
export const useSensorStore = create<SensorState>(set => ({
  latest: null,
  setLatest: (latest) => set({ latest })
}))
