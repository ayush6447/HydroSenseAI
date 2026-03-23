import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SensorCard from '../components/Dashboard/SensorCard';
import ActuatorPanel from '../components/Dashboard/ActuatorPanel';
import AlertBanner from '../components/Dashboard/AlertBanner';
import SensorChart from '../components/Charts/SensorChart';
export default function Dashboard() {
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6", children: "Dashboard" }), _jsx(AlertBanner, {}), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [_jsx(SensorCard, { label: "pH", value: 5.9, unit: "", status: "ok" }), _jsx(SensorCard, { label: "TDS", value: 1154, unit: "ppm", status: "ok" }), _jsx(SensorCard, { label: "Water Temp", value: 21.5, unit: "\u00B0C", status: "ok" }), _jsx(SensorCard, { label: "Air Temp", value: 24.4, unit: "\u00B0C", status: "ok" }), _jsx(SensorCard, { label: "Humidity", value: 71, unit: "%", status: "ok" }), _jsx(SensorCard, { label: "Water Level", value: 2, unit: "/3", status: "ok" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(SensorChart, {}), _jsx(ActuatorPanel, {})] })] }));
}
