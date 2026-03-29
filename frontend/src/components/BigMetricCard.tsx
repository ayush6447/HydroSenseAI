"use client";

import { LucideIcon, FlaskConical, Gauge, TrendingUp } from "lucide-react";

interface BigMetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  subValue?: string;
  forecast?: string;
  icon?: LucideIcon;
  variant?: "ph" | "tds";
}

export default function BigMetricCard({
  label,
  value,
  unit,
  subValue,
  forecast,
  icon: Icon,
  variant,
}: BigMetricCardProps) {
  return (
    <div className="bg-card/40 border border-card/80 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow flex-1 group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">{label}</h3>
          
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-text tracking-tighter">
              {typeof value === "number" ? value.toFixed(1) : value}
            </span>
            <span className="text-lg font-bold text-muted">{unit}</span>
            {subValue && (
              <span className="ml-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {variant === 'ph' ? (
           <div className="p-3 bg-accent/10 text-accent rounded-2xl">
              <FlaskConical className="w-8 h-8" />
           </div>
        ) : (
           <div className="p-3 bg-accent/10 text-accent rounded-2xl">
              <Gauge className="w-8 h-8" />
           </div>
        )}
      </div>

      {forecast && (
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-card/60">
           <TrendingUp className="w-4 h-4 text-muted" />
           <p className="text-xs font-semibold text-muted">
              Forecast: <span className="text-text">{forecast}</span>
           </p>
        </div>
      )}
    </div>
  );
}
