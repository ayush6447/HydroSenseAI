import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Droplet, Thermometer, Wind, Beaker, Waves, Activity, Cpu, Camera, Power, RefreshCw, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { submitSensors } from './api/hydrosense';
const INITIAL_MOCK_STATE = {
    recommendation: "System online. Waiting for telemetry...",
    status: "NORMAL",
    primary_issue: null,
    yield: { yield_score: 100, severity: "none" },
    disease: { detected_class: "unknown", confidence: 0.0 },
    fault: { is_default: 0, status: "normal", reason: "" },
    forecast: { ph_predicted: 6.0, tds_predicted: 1200 }
};
const INITIAL_HISTORY = Array.from({ length: 30 }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    pH: 6.0,
    TDS: 1200
}));
export default function App() {
    const [data, setData] = useState(INITIAL_MOCK_STATE);
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [isScanning, setIsScanning] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    // Generate mock sensor data to send to the backend
    const generateSensorInputs = () => ({
        ph: (5.0 + Math.random() * 2).toFixed(1), // 5.0 - 7.0
        tds: Math.floor(600 + Math.random() * 1200), // 600 - 1800
        water_level: (1 + Math.random() * 2).toFixed(1),
        dht_temp: (18 + Math.random() * 12).toFixed(1),
        dht_humidity: Math.floor(40 + Math.random() * 50),
        water_temp: (16 + Math.random() * 10).toFixed(1),
        ph_reducer: Math.random() > 0.8 ? "ON" : "OFF",
        add_water: Math.random() > 0.8 ? "ON" : "OFF",
        nutrients_adder: Math.random() > 0.8 ? "ON" : "OFF",
        humidifier: Math.random() > 0.8 ? "ON" : "OFF",
        ex_fan: Math.random() > 0.5 ? "ON" : "OFF",
    });
    const handleTestAPI = async () => {
        setIsPulling(true);
        try {
            const inputs = generateSensorInputs();
            const response = await submitSensors(inputs);
            setData(response);
            // Update graph historical view
            setHistory(prev => {
                const newPoint = {
                    time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
                    pH: parseFloat(inputs.ph),
                    TDS: inputs.tds
                };
                return [...prev.slice(1), newPoint];
            });
        }
        catch (e) {
            console.error("Failed to hit backend", e);
            alert("Failed to connect to backend on localhost:8000/api/orchestrate");
        }
        finally {
            setIsPulling(false);
        }
    };
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            // For a real integration, append this file to a FormData and post to /api/predict/plant-health
            setIsScanning(true);
            setTimeout(() => {
                setIsScanning(false);
                setData((prev) => ({
                    ...prev,
                    disease: { detected_class: "UploadedImage.jpg", confidence: 0.98 }
                }));
            }, 1500);
        }
    };
    const isFault = data.fault.is_default === 1;
    const isWarning = data.yield.yield_score < 70;
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground font-sans p-4 md:p-8", children: [_jsxs("header", { className: "max-w-7xl mx-auto mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-white mb-1", children: "HYDROSENSE AI" }), _jsxs("p", { className: "text-muted text-sm font-mono flex items-center gap-2", children: [_jsx("span", { className: `block w-2 h-2 rounded-full ${isFault ? 'bg-white' : 'bg-muted'}` }), "LOCAL SYSTEM TERMINAL"] })] }), _jsxs("button", { onClick: handleTestAPI, disabled: isPulling, className: "flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isPulling ? 'animate-spin' : ''}` }), "TRIGGER API ORCHESTRATOR"] })] }), _jsx("div", { className: `
          border p-6 transition-colors duration-300
          ${isFault || isWarning ? 'bg-white text-black border-white' : 'bg-surface text-foreground border-border'}
        `, children: _jsxs("div", { className: "flex items-start gap-4", children: [(isFault || isWarning) ? (_jsx(AlertTriangle, { className: "w-8 h-8 shrink-0" })) : (_jsx(Activity, { className: "w-8 h-8 shrink-0" })), _jsxs("div", { children: [_jsx("h2", { className: "text-xs uppercase tracking-widest font-bold mb-1 opacity-70", children: "Orchestrator Directive" }), _jsx("p", { className: "text-xl font-medium tracking-tight", children: data.recommendation })] })] }) })] }), _jsxs("main", { className: "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-4 space-y-6", children: [_jsxs("section", { className: "bg-surface border border-border p-6", children: [_jsx("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-6", children: "Telemetry Cache" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(SensorCard, { title: "pH Level", value: history[history.length - 1].pH.toFixed(1), ideal: "5.5-6.5", unit: "pH", icon: _jsx(Beaker, {}) }), _jsx(SensorCard, { title: "TDS", value: history[history.length - 1].TDS, ideal: "800-1600", unit: "ppm", icon: _jsx(Waves, {}) }), _jsx(SensorCard, { title: "Water Temp", value: "--", ideal: "18-24", unit: "\u00B0C", icon: _jsx(Thermometer, {}) }), _jsx(SensorCard, { title: "Air Temp", value: "--", ideal: "20-28", unit: "\u00B0C", icon: _jsx(Thermometer, {}) }), _jsx(SensorCard, { title: "Humidity", value: "--", ideal: "50-80", unit: "%", icon: _jsx(Wind, {}) }), _jsx(SensorCard, { title: "Level", value: "--", ideal: "1-3", unit: "/3", icon: _jsx(Droplet, {}) })] })] }), _jsxs("section", { className: "bg-surface border border-border p-6", children: [_jsx("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-6", children: "Hardware Relays" }), _jsxs("div", { className: "space-y-3", children: [_jsx(ActuatorToggle, { name: "pH Reducer", active: false }), _jsx(ActuatorToggle, { name: "Water Pump", active: true }), _jsx(ActuatorToggle, { name: "Nutrients Adder", active: false }), _jsx(ActuatorToggle, { name: "Humidifier", active: false }), _jsx(ActuatorToggle, { name: "Exhaust Fan", active: true })] })] })] }), _jsxs("div", { className: "lg:col-span-8 flex flex-col gap-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-surface border border-border p-6 flex flex-col items-center justify-center relative", children: [_jsx("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-4 self-start", children: "Yield Predictor (XGBoost)" }), _jsxs("div", { className: "relative flex items-center justify-center w-40 h-40", children: [_jsxs("svg", { className: "w-full h-full transform -rotate-90", children: [_jsx("circle", { cx: "80", cy: "80", r: "70", className: "stroke-border", strokeWidth: "6", fill: "none" }), _jsx("circle", { cx: "80", cy: "80", r: "70", className: "stroke-white transition-all duration-1000", strokeWidth: "6", fill: "none", strokeDasharray: "440", strokeDashoffset: 440 - (440 * data.yield.yield_score) / 100, strokeLinecap: "square" })] }), _jsxs("div", { className: "absolute flex flex-col items-center", children: [_jsx("span", { className: "text-4xl font-light text-white", children: data.yield.yield_score }), _jsx("span", { className: "text-[10px] text-muted uppercase tracking-widest mt-1", children: "Score" })] })] })] }), _jsxs("div", { className: "bg-surface border border-border p-6 flex flex-col justify-between", children: [_jsx("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-4", children: "Fault Classifier" }), _jsxs("div", { className: `
                flex-1 flex flex-col items-center justify-center border border-dashed
                ${isFault ? 'bg-white text-black border-white' : 'bg-transparent border-border text-white'}
              `, children: [_jsx(Cpu, { className: `w-12 h-12 mb-3 ${isFault ? 'animate-pulse' : 'opacity-50'}` }), _jsx("span", { className: "text-sm font-semibold tracking-widest uppercase", children: isFault ? 'ERROR DETECTED' : 'SYSTEM NOMINAL' }), data.fault.reason && (_jsxs("span", { className: "text-xs mt-2 font-mono px-3 py-1 font-bold", children: ["[ ", data.fault.reason, " ]"] }))] })] })] }), _jsxs("div", { className: "bg-surface border border-border p-6", children: [_jsxs("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-6 flex justify-between items-center", children: [_jsx("span", { children: "Predictive Forecast (LSTM)" }), _jsxs("span", { className: "font-mono bg-white text-black px-2 py-1 text-[10px]", children: ["T-30 TGT: pH ", data.forecast.ph_predicted] })] }), _jsx("div", { className: "h-64 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: history, children: [_jsx(CartesianGrid, { strokeDasharray: "2 2", stroke: "#27272a", vertical: false }), _jsx(XAxis, { dataKey: "time", stroke: "#a1a1aa", fontSize: 10, tickMargin: 10, minTickGap: 30, axisLine: false, tickLine: false }), _jsx(YAxis, { domain: ['auto', 'auto'], stroke: "#a1a1aa", fontSize: 10, width: 30, axisLine: false, tickLine: false }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }, itemStyle: { color: '#fafafa' } }), _jsx(ReferenceLine, { y: 6.5, stroke: "#52525b", strokeDasharray: "3 3" }), _jsx(Line, { type: "step", dataKey: "pH", stroke: "#fafafa", strokeWidth: 2, dot: false, activeDot: { r: 4, fill: '#fafafa', stroke: '#09090b', strokeWidth: 2 }, isAnimationActive: false })] }) }) })] }), _jsxs("div", { className: "bg-surface border border-border p-6 overflow-hidden relative group", children: [_jsx("input", { type: "file", accept: "image/*", className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20", onChange: handleImageUpload, disabled: isScanning }), _jsxs("div", { className: "flex flex-col md:flex-row items-center gap-6 relative z-10", children: [_jsx("div", { className: "w-24 h-24 shrink-0 bg-background border border-border flex items-center justify-center relative overflow-hidden", children: isScanning ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 bg-white opacity-10 animate-pulse" }), _jsx("div", { className: "absolute top-0 left-0 w-full h-[1px] bg-white animate-[scan_1.5s_linear_infinite]" })] })) : (_jsx(Camera, { className: "w-8 h-8 text-muted" })) }), _jsxs("div", { className: "flex-1 text-center md:text-left", children: [_jsx("h3", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-2", children: "Vision Scanner (YOLOv8)" }), _jsx("p", { className: "text-muted text-xs mb-4", children: "Click to upload crop sample image for rapid detection." }), data.disease.detected_class !== "unknown" && !isScanning && (_jsxs("div", { className: "inline-flex items-center gap-3 bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest", children: [_jsx("span", { children: data.disease.detected_class }), _jsxs("span", { className: "font-mono border-l border-zinc-300 pl-3", children: [(data.disease.confidence * 100).toFixed(1), "% CONF"] })] }))] })] })] })] })] }), _jsx("style", { children: `
        @keyframes scan {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(110px); }
        }
      ` })] }));
}
function SensorCard({ title, value, unit, icon }) {
    return (_jsxs("div", { className: "bg-background p-4 border border-border", children: [_jsx("div", { className: "flex justify-between items-start mb-4", children: _jsx("div", { className: "text-muted", children: icon }) }), _jsx("p", { className: "text-muted text-xs uppercase tracking-widest font-semibold mb-1", children: title }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsx("span", { className: "text-2xl font-light text-white", children: value }), _jsx("span", { className: "text-xs text-muted font-mono", children: unit })] })] }));
}
function ActuatorToggle({ name, active }) {
    return (_jsxs("div", { className: "flex items-center justify-between p-3 bg-background border border-border", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Power, { className: `w-4 h-4 ${active ? 'text-white' : 'text-zinc-700'}` }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-widest text-muted", children: name })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: `text-[10px] font-mono font-bold ${active ? 'text-white' : 'text-zinc-600'}`, children: active ? 'ON' : 'OFF' }) })] }));
}
