"use client";

import DashboardLayout from "../../components/DashboardLayout";
import CropHealthCard from "../../components/CropHealthCard";

export default function DiagnosticsPage() {
  return (
    <DashboardLayout>
      <div className="py-12 space-y-12">
        <h1 className="text-4xl font-black text-text uppercase tracking-tight mb-4">AI Diagnostics</h1>
        <p className="text-muted font-medium">Coordinate advanced crop Health analysis through multi-model AI inference engine.</p>
        <div className="max-w-4xl">
           <CropHealthCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
