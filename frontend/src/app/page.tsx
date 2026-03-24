"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { login, fetchSensorData, fetchOrchestrationData } from "../lib/api";
import StatusHud from "../components/StatusHud";
import LiveGauges from "../components/LiveGauges";
import Sparklines from "../components/Sparklines";
import AiInsights from "../components/AiInsights";
import PlantDiagnostic from "../components/PlantDiagnostic";

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);

  // Auth Effect
  useEffect(() => {
    login().then(setToken).catch(console.error);
  }, []);

  const { data: sensorData, isError: sensorError } = useQuery({
    queryKey: ["sensorData"],
    queryFn: () => fetchSensorData(token!),
    enabled: !!token,
    refetchInterval: 5000, // 5s polling for sensors
  });

  const { data: orchestrationData, isError: orchestrationError } = useQuery({
    queryKey: ["orchestrationData"],
    queryFn: () => fetchOrchestrationData(token!),
    enabled: !!token,
    refetchInterval: 10000, // 10s polling for AI orchestrator
  });

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-3xl font-bold text-theme-5 animate-pulse">Initializing Dashboard...</h1>
      </main>
    );
  }

  if (sensorError || orchestrationError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 text-red-500">
        <h1 className="text-2xl font-bold">Error fetching data. Check backend connection.</h1>
      </main>
    );
  }

  const sparklineMetrics = sensorData
    ? [
        { name: "Water Level", value: sensorData.water_level, unit: "lvl" },
        { name: "Air Temp", value: sensorData.dht_temp, unit: "°C" },
        { name: "Humidity", value: sensorData.dht_humidity, unit: "%" },
        { name: "Water Temp", value: sensorData.water_temp, unit: "°C" },
        { name: "pH", value: sensorData.ph, unit: "pH" },
        { name: "TDS", value: sensorData.tds, unit: "ppm" },
      ]
    : [];

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-theme-4">
        <div>
          <h1 className="text-3xl font-black text-theme-5 tracking-tight">HydroSenseAI</h1>
          <p className="text-gray-500 font-medium">Multi-Model AI Agriculture Orchestrator</p>
        </div>
        {orchestrationData && (
          <StatusHud status={orchestrationData.orchestrator_output.status} />
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Live Gauges & Metrics */}
          {sensorData ? (
            <>
              <LiveGauges ph={sensorData.ph} tds={sensorData.tds} />
              <Sparklines metrics={sparklineMetrics} />
            </>
          ) : (
            <div className="h-64 bg-theme-2 animate-pulse rounded-2xl"></div>
          )}
          <PlantDiagnostic />
        </div>

        <div className="lg:col-span-1">
          {/* AI Orchestrator Output Panel */}
          {orchestrationData ? (
            <AiInsights 
              output={orchestrationData.orchestrator_output} 
              insights={orchestrationData.insights} 
              actuatorState={orchestrationData.actuator_state}
            />
          ) : (
            <div className="h-96 bg-theme-2 animate-pulse rounded-2xl"></div>
          )}
        </div>
      </div>
    </main>
  );
}
