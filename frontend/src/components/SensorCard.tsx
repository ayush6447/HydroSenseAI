"use client";

import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
}

export default function SensorCard({ label, value, unit, icon: Icon }: SensorCardProps) {
  return (
    <div className="bg-card/30 border border-card/80 p-5 rounded-3xl flex items-center justify-between hover:bg-card/50 transition-colors shadow-sm cursor-default">
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-text leading-tight">{value}</span>
          <span className="text-xs font-semibold text-muted">{unit}</span>
        </div>
      </div>
      <div className="p-2 bg-accent/10 text-accent rounded-xl">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
