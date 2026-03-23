import { Link } from 'react-router-dom'
const links = [['/', 'Dashboard'], ['/predictions', 'Predictions'], ['/plant-health', 'Plant Health'], ['/history', 'History'], ['/settings', 'Settings']]
export default function Sidebar() {
  return (
    <aside className="w-56 border-r h-full flex flex-col p-4">
      <h2 className="font-semibold mb-6 text-green-700">HydroAI</h2>
      {links.map(([to, label]) => <Link key={to} to={to} className="py-2 px-3 rounded hover:bg-gray-100 text-sm mb-1">{label}</Link>)}
    </aside>
  )
}
