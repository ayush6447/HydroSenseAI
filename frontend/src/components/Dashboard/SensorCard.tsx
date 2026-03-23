interface Props { label: string; value: number; unit: string; status: 'ok' | 'warn' | 'error' }
export default function SensorCard({ label, value, unit, status }: Props) {
  const color = status === 'ok' ? 'text-green-600' : status === 'warn' ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}{unit}</p>
    </div>
  )
}
