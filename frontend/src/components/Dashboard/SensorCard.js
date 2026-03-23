import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SensorCard({ label, value, unit, status }) {
    const color = status === 'ok' ? 'text-green-600' : status === 'warn' ? 'text-yellow-600' : 'text-red-600';
    return (_jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: label }), _jsxs("p", { className: `text-2xl font-semibold ${color}`, children: [value, unit] })] }));
}
