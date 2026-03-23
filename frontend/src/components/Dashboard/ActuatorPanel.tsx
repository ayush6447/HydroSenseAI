const actuators = ['pH Reducer', 'Add Water', 'Nutrients', 'Humidifier', 'Ex Fan']
export default function ActuatorPanel() {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium mb-3">Actuator States</h3>
      {actuators.map(a => (
        <div key={a} className="flex items-center justify-between py-2 border-b last:border-0">
          <span className="text-sm">{a}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">OFF</span>
        </div>
      ))}
    </div>
  )
}
