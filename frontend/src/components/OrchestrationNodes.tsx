"use client";

import { Cpu, Power, RotateCcw, ShieldCheck, Map, CheckCircle2 } from "lucide-react";

interface OrchestrationNodesProps {
  actuatorState: Record<string, boolean>;
  output: {
    status: string;
    priority_action: string;
  };
  onReset?: () => void;
  onIsolate?: () => void;
}

export default function OrchestrationNodes({ actuatorState, output, onReset, onIsolate }: OrchestrationNodesProps) {
  const formatKey = (key: string) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-8 h-full flex flex-col pt-4">
      
      {/* AI Insights Card */}
      <div className="bg-card/40 border border-card/80 p-8 rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-accent font-black text-xs uppercase tracking-widest">
           <Cpu className="w-5 h-5" />
           <span>AI Insights</span>
        </div>
        <h4 className="text-2xl font-black text-text tracking-tight uppercase">{output.status === 'GREEN' ? 'System Optimal' : output.priority_action}</h4>
        <p className="text-sm font-medium text-muted leading-relaxed">
           No immediate actions required. All environmental parameters are synchronized with the 
           <span className="text-accent underline cursor-pointer font-bold"> Genovese-04</span> growth profile.
        </p>

        <div className="space-y-3 pt-6">
           <div className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl border border-card/80">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
              <p className="text-xs font-bold text-muted leading-tight">Nutrient delivery precisely calibrated.</p>
           </div>
           <div className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl border border-card/80">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
              <p className="text-xs font-bold text-muted leading-tight">CO2 levels maintained at 800ppm.</p>
           </div>
        </div>
      </div>

      {/* Orchestration Nodes (Toggles) */}
      <div className="bg-card/40 border border-card/80 p-5 lg:p-8 rounded-[2.5rem] shadow-sm space-y-8 flex-1">
        <div className="flex items-center gap-3 text-accent font-black text-xs uppercase tracking-widest">
           <ShieldCheck className="w-5 h-5" />
           <span>Orchestration Nodes</span>
        </div>

        <div className="space-y-4">
           {Object.entries(actuatorState).map(([key, isOn]) => (
              <div key={key} className="flex justify-between items-center group">
                 <span className="text-xs font-bold uppercase tracking-widest text-muted">{formatKey(key)}</span>
                 <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                    isOn ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-sidebar/50 text-muted opacity-50'
                 }`}>
                    {isOn ? 'ACTIVE' : 'OFF'}
                 </div>
              </div>
           ))}
        </div>

        <div className="pt-10 space-y-4 border-t border-card/60">
           <h5 className="text-[10px] font-black uppercase tracking-widest text-muted">Manual Override</h5>
           <div className="flex gap-4">
              <button 
                onClick={onReset}
                className="flex-1 bg-sidebar/50 flex flex-col items-center justify-center p-6 rounded-[2rem] border border-card transition-all hover:bg-sidebar hover:scale-105 active:scale-95 space-y-4"
              >
                 <RotateCcw className="w-6 h-6 text-text" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
              </button>
              <button 
                onClick={onIsolate}
                className="flex-1 bg-sidebar/50 flex flex-col items-center justify-center p-6 rounded-[2rem] border border-card transition-all hover:bg-red-50 hover:scale-105 active:scale-95 space-y-4"
              >
                 <Power className="w-6 h-6 text-red-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Isolate</span>
              </button>
           </div>
        </div>
      </div>


      {/* Map/Zone Card */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-accent/20 h-64 shadow-xl border border-card/80 group">
         <div className="absolute inset-0 bg-accent/30 group-hover:bg-accent/40 transition-colors flex items-center justify-center">
            <Map className="w-20 h-20 text-accent/40 -rotate-12" />
         </div>
         <div className="absolute top-6 left-6 bg-white/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-text">ZONE A-04</span>
         </div>
      </div>

    </div>
  );
}

