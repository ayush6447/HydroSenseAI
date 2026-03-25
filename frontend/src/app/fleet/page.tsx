"use client";

import DashboardLayout from "../../components/DashboardLayout";

export default function FleetPage() {
  return (
    <DashboardLayout>
      <div className="py-12">
        <h1 className="text-4xl font-black text-text uppercase tracking-tight mb-4">Fleet Hub</h1>
        <p className="text-muted font-medium">Manage and optimize autonomous agricultural machinery and sensor nodes.</p>
        <div className="mt-12 bg-card/10 border-2 border-dashed border-card p-24 rounded-[3rem] text-center border-accent/20">
           <div className="text-accent text-lg font-black uppercase tracking-widest mb-2">Fleet Offline</div>
           <div className="text-muted text-[10px] font-black uppercase tracking-[0.4em]">Connect your first node to start orchestrating.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
