"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSensorData, fetchOrchestrationData, resetActuators, isolateSystem, startSimulation, stopSimulation, getSimulationStatus } from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import HeroCard from "../components/HeroCard";
import BigMetricCard from "../components/BigMetricCard";
import SensorMatrix from "../components/SensorMatrix";
import CropHealthCard from "../components/CropHealthCard";
import OrchestrationNodes from "../components/OrchestrationNodes";
import YieldProbabilityCard from "../components/YieldProbabilityCard";
import { Loader } from "lucide-react";

export default function Dashboard() {

  const queryClient = useQueryClient();
  const token = "dummy-token";

  const { data: simStatus } = useQuery({
    queryKey: ["simulationStatus"],
    queryFn: getSimulationStatus,
    refetchInterval: 3000,
  });

  const simStartMutation = useMutation({
    mutationFn: () => startSimulation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["sensorData"] });
      queryClient.invalidateQueries({ queryKey: ["orchestrationData"] });
    },
  });

  const simStopMutation = useMutation({
    mutationFn: () => stopSimulation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["sensorData"] });
      queryClient.invalidateQueries({ queryKey: ["orchestrationData"] });
    },
  });

  const { data: sensorData, isError: sensorError, isLoading: isSensorLoading } = useQuery({
    queryKey: ["sensorData"],
    queryFn: () => fetchSensorData(token),
    enabled: true,
    refetchInterval: 5000,
  });

  const { data: orchestrationData, isError: orchestrationError, isLoading: isOrchestrationLoading } = useQuery({
    queryKey: ["orchestrationData"],
    queryFn: () => fetchOrchestrationData(token),
    enabled: true,
    refetchInterval: 10000,
  });

  const resetMutation = useMutation({
    mutationFn: () => resetActuators(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestrationData"] });
    },
  });

  const isolateMutation = useMutation({
    mutationFn: () => isolateSystem(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestrationData"] });
    },
  });

  const isLoading = isSensorLoading || isOrchestrationLoading;

  if (sensorError || orchestrationError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-24 bg-background text-red-500">
        <h1 className="text-2xl font-bold">Error fetching data. Check backend connection.</h1>
      </main>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12 pt-4">
        {isLoading || !orchestrationData ? (
          <div className="flex items-center justify-center h-96">
            <Loader className="w-10 h-10 animate-spin text-accent" />
          </div>
        ) : (!sensorData || orchestrationData?.orchestrator_output?.status === "OFFLINE") ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
             <div className="p-6 bg-red-500/10 text-red-500 rounded-full animate-pulse border border-red-500/30">
                <Loader className="w-12 h-12" />
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-black text-text uppercase tracking-tight">Hardware Disconnected</h2>
                <p className="text-muted font-medium max-w-md mx-auto">
                  The AI core is waiting for telemetry. Connect your sensors or enable simulation mode to demo the platform.
                </p>
             </div>
             <button 
               onClick={() => simStartMutation.mutate()}
               className="mt-4 px-8 py-4 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-accent/20"
             >
               ▶ Enable Simulation Mode
             </button>
          </div>
        ) : (
          <>
          {/* Simulation Banner */}
          {simStatus?.active && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 text-amber-700 px-6 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Simulation Mode Active — Data is synthetic</span>
              </div>
              <button
                onClick={() => simStopMutation.mutate()}
                className="text-xs font-black uppercase tracking-widest bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 rounded-xl transition-colors"
              >
                ■ Stop Simulation
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            <div className="lg:col-span-2 space-y-12">
              <HeroCard status={orchestrationData?.orchestrator_output?.status} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <BigMetricCard
                    label="PH LEVEL"
                    value={sensorData?.ph || 0}
                    unit="pH"
                    variant="ph"
                 />
                 <BigMetricCard
                    label="TDS CONCENTRATION"
                    value={sensorData?.tds || 0}
                    unit="ppm"
                    variant="tds"
                 />
              </div>
              <YieldProbabilityCard value={orchestrationData?.orchestrator_output?.predicted_yield ?? "N/A"} />
              <SensorMatrix data={sensorData} />
              <CropHealthCard />
            </div>

            <div className="lg:col-span-1 h-full">
              <OrchestrationNodes 
                 actuatorState={orchestrationData.actuator_state} 
                 output={orchestrationData.orchestrator_output} 
                 onReset={() => resetMutation.mutate()}
                 onIsolate={() => isolateMutation.mutate()}
              />
            </div>

          </div>
          </>
        )}
        
        {/* Development Debug Panel */}
        {orchestrationData && (
          <div className="mt-12 p-6 bg-slate-900 text-green-400 rounded-xl overflow-x-auto text-xs font-mono">
            <h3 className="text-white mb-2 font-bold uppercase tracking-wider">Raw API Data Trace</h3>
            <pre>{JSON.stringify(orchestrationData, null, 2)}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
