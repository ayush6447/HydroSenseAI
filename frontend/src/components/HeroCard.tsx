"use client";

import { CheckCircle2, FileSliders } from "lucide-react";

export default function HeroCard({ status }: { status?: string }) {
  const statusColor = status === "RED" ? "bg-red-400" : status === "YELLOW" ? "bg-amber-400" : "bg-green-400";
  const statusText = status === "RED" ? "CRITICAL" : status === "YELLOW" ? "WARNING" : "GREEN";

  return (
    <div className={`bg-hero p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${status === 'RED' ? 'ring-4 ring-red-500/50' : status === 'YELLOW' ? 'ring-4 ring-amber-500/50' : ''}`}>
      {/* Background Graphic/Overlay simulation */}
      <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:opacity-15 transition-opacity">
        <CheckCircle2 className="w-80 h-80 -rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit mb-8">
          <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse shadow-[0_0_10px_currentColor]`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">System Health: {statusText}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-4 max-w-xl">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Orchestrated by<br />HydroSense AI Core
            </h1>
            <p className="text-white/70 text-base leading-relaxed font-medium">
              Real-time nutrient optimization and climate control active. 
              Predictive maintenance scheduled for 14:00 UTC.
            </p>
          </div>

          <div className="flex flex-col items-end gap-6 text-right w-full md:w-auto">
             <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Active Crop</span>
                <span className="text-2xl font-bold block">Heirloom Basil Genovese</span>
             </div>
             
             <button className="flex items-center gap-3 bg-[#E3EBE3]/20 hover:bg-[#E3EBE3]/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 transition-all group-active:scale-95 shadow-xl">
                <FileSliders className="w-6 h-6 text-white" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">Optimization Report</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
