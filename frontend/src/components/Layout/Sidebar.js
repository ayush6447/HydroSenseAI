import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const links = [['/', 'Dashboard'], ['/predictions', 'Predictions'], ['/plant-health', 'Plant Health'], ['/history', 'History'], ['/settings', 'Settings']];
export default function Sidebar() {
    return (_jsxs("aside", { className: "w-56 border-r h-full flex flex-col p-4", children: [_jsx("h2", { className: "font-semibold mb-6 text-green-700", children: "HydroAI" }), links.map(([to, label]) => _jsx(Link, { to: to, className: "py-2 px-3 rounded hover:bg-gray-100 text-sm mb-1", children: label }, to))] }));
}
