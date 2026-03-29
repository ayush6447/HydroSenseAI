"use client";

import DashboardLayout from "../../components/DashboardLayout";

export default function FarmsPage() {
  return (
    <DashboardLayout>
      <div className="py-12">
        <h1 className="text-4xl font-black text-text uppercase tracking-tight mb-4">Farms Management</h1>
        <p className="text-muted font-medium">Coordinate and monitor multi-zone agricultural operations across all locations.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => (
             <div key={i} className="bg-card/40 border border-card/80 p-8 rounded-[3rem] space-y-4">
                <div className="h-48 bg-[#CFDDCF] rounded-[2rem] shadow-inner opacity-40 animate-pulse" />
                <div className="h-5 bg-text/20 w-3/4 rounded-full" />
                <div className="h-3 bg-text/10 w-1/2 rounded-full" />
             </div>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
