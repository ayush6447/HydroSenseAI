import { useState, useEffect } from 'react'
import { getLatest } from '../api/sensor'
import type { SensorReading } from '../types/sensor'

export function useSensorData() {
  const [data, setData] = useState<SensorReading | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getLatest().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])
  return { data, loading }
}
