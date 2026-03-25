"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSensorData, fetchOrchestrationData, resetActuators, isolateSystem } from "../lib/api";
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

        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            <div className="lg:col-span-2 space-y-12">
              <HeroCard />
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
              <YieldProbabilityCard value={orchestrationData?.orchestrator_output?.predicted_yield || 85} />
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
        )}
      </div>
    </DashboardLayout>
  );
}
