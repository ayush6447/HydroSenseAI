import React, { useState, useEffect } from 'react';
import { 
  Droplet, Thermometer, Wind, Beaker, Waves, Fan, Activity, 
  Cpu, Camera, Power, RefreshCw, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine 
} from 'recharts';
import { submitSensors, uploadPlantImage } from './api/hydrosense';

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
  time: `10:${i < 10 ? '0'+i : i}`,
  pH: 6.0,
  TDS: 1200
}));

export default function App() {
  const [data, setData] = useState<any>(INITIAL_MOCK_STATE);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [isScanning, setIsScanning] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  // Generate mock sensor data to send to the backend
  const generateSensorInputs = () => ({
    ph: parseFloat((5.0 + Math.random() * 2).toFixed(1)), 
    tds: Math.floor(600 + Math.random() * 1200), 
    water_level: Math.floor(1 + Math.random() * 3), 
    dht_temp: parseFloat((18 + Math.random() * 12).toFixed(1)), 
    dht_humidity: Math.floor(40 + Math.random() * 50), 
    water_temp: parseFloat((16 + Math.random() * 10).toFixed(1)), 
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
          time: new Date().toLocaleTimeString([], {minute: '2-digit', second:'2-digit'}),
          pH: inputs.ph,
          TDS: inputs.tds
        };
        return [...prev.slice(1), newPoint];
      });
    } catch (e: any) {
      console.error("Failed to hit backend", e);
      const detail = e.response?.data?.detail 
        ? JSON.stringify(e.response.data.detail) 
        : e.message;
      alert("Validation Error: " + detail);
    } finally {
      setIsPulling(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsScanning(true);
      try {
        const result = await uploadPlantImage(file);
        setData((prev: any) => ({
          ...prev, 
          disease: { 
            detected_class: result.detected_class || "Unknown", 
            confidence: result.confidence || 0.0 
          }
        }));
      } catch (err) {
        alert("Failed to hit YOLOv8 plant-health endpoint");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const isFault = data.fault.is_default === 1;
  const isWarning = data.yield.yield_score < 70;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      
      {/* HEADER & ORCHESTRATOR BANNER */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
              HYDROSENSE AI
            </h1>
            <p className="text-muted text-sm font-mono flex items-center gap-2">
              <span className={`block w-2 h-2 rounded-full ${isFault ? 'bg-white' : 'bg-muted'}`}></span>
              LOCAL SYSTEM TERMINAL
            </p>
          </div>
          <button 
            onClick={handleTestAPI}
            disabled={isPulling}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
            TRIGGER API ORCHESTRATOR
          </button>
        </div>

        {/* AI Action Banner */}
        <div className={`
          border p-6 transition-colors duration-300
          ${isFault || isWarning ? 'bg-white text-black border-white' : 'bg-surface text-foreground border-border'}
        `}>
          <div className="flex items-start gap-4">
            {(isFault || isWarning) ? (
              <AlertTriangle className="w-8 h-8 shrink-0" />
            ) : (
              <Activity className="w-8 h-8 shrink-0" />
            )}
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold mb-1 opacity-70">
                Orchestrator Directive
              </h2>
              <p className="text-xl font-medium tracking-tight">
                {data.recommendation}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE SENSORS & ACTUATORS */}
        <div className="lg:col-span-4 space-y-6">
          
          <section className="bg-surface border border-border p-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">
              Telemetry Cache
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <SensorCard title="pH Level" value={history[history.length-1].pH.toFixed(1)} ideal="5.5-6.5" unit="pH" icon={<Beaker />} />
              <SensorCard title="TDS" value={history[history.length-1].TDS} ideal="800-1600" unit="ppm" icon={<Waves />} />
              <SensorCard title="Water Temp" value="--" ideal="18-24" unit="°C" icon={<Thermometer />} />
              <SensorCard title="Air Temp" value="--" ideal="20-28" unit="°C" icon={<Thermometer />} />
              <SensorCard title="Humidity" value="--" ideal="50-80" unit="%" icon={<Wind />} />
              <SensorCard title="Level" value="--" ideal="1-3" unit="/3" icon={<Droplet />} />
            </div>
          </section>

          <section className="bg-surface border border-border p-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">
              Hardware Relays
            </h3>
            <div className="space-y-3">
              <ActuatorToggle name="pH Reducer" active={false} />
              <ActuatorToggle name="Water Pump" active={true} />
              <ActuatorToggle name="Nutrients Adder" active={false} />
              <ActuatorToggle name="Humidifier" active={false} />
              <ActuatorToggle name="Exhaust Fan" active={true} />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: AI MODELS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* XGBoost Yield */}
            <div className="bg-surface border border-border p-6 flex flex-col items-center justify-center relative">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 self-start">
                Yield Predictor (XGBoost)
              </h3>
              
              <div className="relative flex items-center justify-center w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" className="stroke-border" strokeWidth="6" fill="none" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    className="stroke-white transition-all duration-1000" 
                    strokeWidth="6" fill="none" 
                    strokeDasharray="440" 
                    strokeDashoffset={440 - (440 * data.yield.yield_score) / 100}
                    strokeLinecap="square"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-light text-white">{data.yield.yield_score}</span>
                  <span className="text-[10px] text-muted uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>
            </div>

            {/* Fault Detection */}
            <div className="bg-surface border border-border p-6 flex flex-col justify-between">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                Fault Classifier
              </h3>
              
              <div className={`
                flex-1 flex flex-col items-center justify-center border border-dashed
                ${isFault ? 'bg-white text-black border-white' : 'bg-transparent border-border text-white'}
              `}>
                <Cpu className={`w-12 h-12 mb-3 ${isFault ? 'animate-pulse' : 'opacity-50'}`} />
                <span className="text-sm font-semibold tracking-widest uppercase">
                  {isFault ? 'ERROR DETECTED' : 'SYSTEM NOMINAL'}
                </span>
                {data.fault.reason && (
                  <span className="text-xs mt-2 font-mono px-3 py-1 font-bold">
                    [ {data.fault.reason} ]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LSTM Forecast */}
          <div className="bg-surface border border-border p-6">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6 flex justify-between items-center">
              <span>Predictive Forecast (LSTM)</span>
              <span className="font-mono bg-white text-black px-2 py-1 text-[10px]">T-30 TGT: pH {data.forecast.ph_predicted}</span>
            </h3>
            
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} tickMargin={10} minTickGap={30} axisLine={false} tickLine={false}/>
                  <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={10} width={30} axisLine={false} tickLine={false}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px' }}
                    itemStyle={{ color: '#fafafa' }}
                  />
                  <ReferenceLine y={6.5} stroke="#52525b" strokeDasharray="3 3" />
                  <Line 
                    type="step" 
                    dataKey="pH" 
                    stroke="#fafafa" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, fill: '#fafafa', stroke: '#09090b', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YOLOv8 Vision Scanner */}
          <div className="bg-surface border border-border p-6 overflow-hidden relative group">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleImageUpload}
              disabled={isScanning}
            />
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="w-24 h-24 shrink-0 bg-background border border-border flex items-center justify-center relative overflow-hidden">
                 {isScanning ? (
                   <>
                    <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white animate-[scan_1.5s_linear_infinite]"></div>
                   </>
                 ) : (
                   <Camera className="w-8 h-8 text-muted" />
                 )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Vision Scanner (YOLOv8)</h3>
                <p className="text-muted text-xs mb-4">Click to upload crop sample image for rapid detection.</p>
                
                {data.disease.detected_class !== "unknown" && !isScanning && (
                  <div className="inline-flex items-center gap-3 bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    <span>{data.disease.detected_class}</span>
                    <span className="font-mono border-l border-zinc-300 pl-3">
                      {(data.disease.confidence * 100).toFixed(1)}% CONF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(110px); }
        }
      `}</style>
    </div>
  );
}

function SensorCard({ title, value, unit, icon }: any) {
  return (
    <div className="bg-background p-4 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className="text-muted">
          {icon}
        </div>
      </div>
      <p className="text-muted text-xs uppercase tracking-widest font-semibold mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-light text-white">{value}</span>
        <span className="text-xs text-muted font-mono">{unit}</span>
      </div>
    </div>
  );
}

function ActuatorToggle({ name, active }: { name: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background border border-border">
      <div className="flex items-center gap-3">
        <Power className={`w-4 h-4 ${active ? 'text-white' : 'text-zinc-700'}`} />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono font-bold ${active ? 'text-white' : 'text-zinc-600'}`}>
          {active ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
