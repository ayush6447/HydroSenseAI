"use client";

import DashboardLayout from "../../components/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="py-12">
        <h1 className="text-4xl font-black text-text uppercase tracking-tight mb-4">Settings</h1>
        <p className="text-muted font-medium">Configure your platform preferences and agricultural orchestration parameters.</p>
        <div className="mt-12 max-w-2xl space-y-6">
           {[1,2,3,4].map(i => (
             <div key={i} className="bg-card/40 border border-card/80 p-8 rounded-[2.5rem] flex justify-between items-center group hover:bg-card transition-all">
                <div className="h-4 w-1/3 bg-card/60 rounded-full" />
                <div className="w-12 h-7 bg-accent/20 rounded-full relative p-1 cursor-pointer">
                   <div className="w-5 h-5 bg-accent rounded-full shadow-sm" />
                </div>
             </div>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
