"use client";

import { TrendingUp, Activity } from "lucide-react";

export default function YieldProbabilityCard({ value }: { value: number | string }) {
  const isNumber = typeof value === 'number';
  const formattedValue = isNumber ? (value as number).toFixed(1) : value;

  return (
    <div className="bg-card/40 border border-card/80 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-10">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Progress chart simulation */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-white/40"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={351.8}
            strokeDashoffset={351.8 * (1 - (isNumber ? (value as number) : 0) / 100)}
            className="text-accent transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-text tracking-tighter">
           {formattedValue}{isNumber ? '%' : ''}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Yield Probability Analysis</h3>
        <h4 className="text-3xl font-black text-text tracking-tight uppercase tracking-tight">AI Growth Trace</h4>
        <p className="text-sm font-medium text-muted leading-relaxed">
           Real-time continuous biological yield projection derived from XGBoost multi-variable gradient tree interpolation.
        </p>
      </div>

      <div className="hidden lg:block opacity-20">
         <Activity className="w-24 h-24 text-accent" />
      </div>
    </div>
  );
}
