export interface SensorReading {
  id: number
  ph: number
  tds: number
  water_level: number
  dht_temp: number
  dht_humidity: number
  water_temp: number
  ph_reducer: 'ON' | 'OFF'
  add_water: 'ON' | 'OFF'
  nutrients_adder: 'ON' | 'OFF'
  humidifier: 'ON' | 'OFF'
  ex_fan: 'ON' | 'OFF'
  timestamp: string
}
