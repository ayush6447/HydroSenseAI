import SensorCard from '../components/Dashboard/SensorCard'
import ActuatorPanel from '../components/Dashboard/ActuatorPanel'
import AlertBanner from '../components/Dashboard/AlertBanner'
import SensorChart from '../components/Charts/SensorChart'

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <AlertBanner />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SensorCard label="pH" value={5.9} unit="" status="ok" />
        <SensorCard label="TDS" value={1154} unit="ppm" status="ok" />
        <SensorCard label="Water Temp" value={21.5} unit="°C" status="ok" />
        <SensorCard label="Air Temp" value={24.4} unit="°C" status="ok" />
        <SensorCard label="Humidity" value={71} unit="%" status="ok" />
        <SensorCard label="Water Level" value={2} unit="/3" status="ok" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SensorChart />
        <ActuatorPanel />
      </div>
    </div>
  )
}
