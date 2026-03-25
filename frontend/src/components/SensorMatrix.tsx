"use client";

import { Droplets, Thermometer, Wind, Zap, FlaskConical, Gauge, TrendingUp, ChevronRight } from "lucide-react";
import SensorCard from "./SensorCard";

interface SensorMatrixProps {
  data: {
    water_level: number;
    dht_temp: number;
    dht_humidity: number;
    water_temp: number;
    ph: number;
    tds: number;
  };
}

export default function SensorMatrix({ data }: SensorMatrixProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <h3 className="text-xl font-black text-text uppercase tracking-tight">Live Sensor Matrix</h3>
         <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-hero transition-colors">
            Full Telemetry <ChevronRight className="w-4 h-4" />
         </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <SensorCard
          label="Water Level"
          value={data.water_level}
          unit="lvl"
          icon={Droplets}
        />
        <SensorCard
          label="Air Temp"
          value={data.dht_temp}
          unit="°C"
          icon={Thermometer}
        />
        <SensorCard
          label="Humidity"
          value={data.dht_humidity}
          unit="%"
          icon={Wind}
        />
        <SensorCard
          label="Water Temp"
          value={data.water_temp}
          unit="°C"
          icon={Zap}
        />
        <SensorCard
          label="PH Value"
          value={data.ph}
          unit="pH"
          icon={FlaskConical}
        />
        <SensorCard
          label="TDS Flow"
          value={data.tds}
          unit="ppm"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}
