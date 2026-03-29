"use client";

import DashboardLayout from "../../components/DashboardLayout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="py-12">
        <h1 className="text-4xl font-black text-text uppercase tracking-tight mb-4">Analytics Engine</h1>
        <p className="text-muted font-medium">Deep data insights and historical performance metrics for your agricultural ecosystem.</p>
        <div className="mt-12 h-96 bg-card/40 border border-card/80 rounded-[3rem] p-12 flex items-center justify-center">
           <div className="text-muted font-black uppercase tracking-[0.3em] text-xs opacity-50">Report Generation in Progress...</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
