import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const actuators = ['pH Reducer', 'Add Water', 'Nutrients', 'Humidifier', 'Ex Fan'];
export default function ActuatorPanel() {
    return (_jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("h3", { className: "font-medium mb-3", children: "Actuator States" }), actuators.map(a => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b last:border-0", children: [_jsx("span", { className: "text-sm", children: a }), _jsx("span", { className: "text-xs bg-gray-100 px-2 py-1 rounded", children: "OFF" })] }, a)))] }));
}
