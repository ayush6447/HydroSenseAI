"use client";

import { CheckCircle2, ChevronRight, History, Loader, PlayCircle, Upload } from "lucide-react";
import { useState, useRef } from "react";

export default function CropHealthCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startTest = () => {
    setIsTesting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({ diagnosis: "HEALTHY", confidence: "99.2%" });
    }, 2000);
  };

  return (
    <div className="bg-card/40 border border-card/80 p-6 lg:p-10 rounded-[2.5rem] shadow-sm space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Analyze Crop Health</h3>
          <h4 className="text-2xl lg:text-3xl font-black text-text tracking-tight uppercase tracking-tight">YOLOv8 Disease Engine</h4>
          <p className="text-sm font-medium text-muted leading-relaxed">
             Snap or <span className="text-accent underline cursor-pointer font-bold" onClick={() => fileInputRef.current?.click()}>upload</span> leaf photos for instant diagnostics.
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-hero transition-colors">
          Diagnostic History <ChevronRight className="w-4 h-4" />
        </button>
      </div>


      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { e.target.files && setSelectedFile(e.target.files[0]); setTestResult(null); }} 
        className="hidden" 
        accept="image/*"
      />

      <div className="space-y-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-card/80 bg-white/40 p-8 lg:p-12 rounded-[2rem] flex flex-col items-center justify-center text-center gap-6 group hover:border-accent transition-all cursor-pointer ${selectedFile ? 'border-accent bg-accent/5' : ''}`}
        >
          <div className="p-6 bg-accent rounded-full text-white shadow-xl shadow-accent/20 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
              <h5 className="text-lg font-black text-text uppercase tracking-tight">
                {selectedFile ? selectedFile.name : "Drag and drop leaf photos"}
              </h5>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Support for JPEG, PNG (max 10MB)</p>
          </div>
        </div>

        {selectedFile && !testResult && (
          <button 
            onClick={(e) => { e.stopPropagation(); startTest(); }}
            disabled={isTesting}
            className="w-full py-4 bg-hero text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {isTesting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (

              <PlayCircle className="w-5 h-5" />
            )}
            {isTesting ? "Processing Engine..." : "Start AI Diagnosis"}
          </button>
        )}
      </div>

      {testResult && (
        <div className="flex flex-col md:flex-row gap-6 pt-4 animate-in fade-in slide-in-from-bottom-2">
           <div className="flex-1 bg-white/50 p-4 rounded-2xl border border-card-accent flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-xl overflow-hidden shadow-inner relative">
                 <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
              </div>
              <div className="space-y-1">
                 <h6 className="text-[10px] font-bold text-muted uppercase tracking-widest">{selectedFile?.name}</h6>
                 <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-tight">
                    <span className="text-accent">Diagnosis: {testResult.diagnosis}</span>
                    <span className="text-muted">({testResult.confidence})</span>
                 </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />
           </div>

           <div className="flex-1 bg-white/50 p-4 rounded-2xl border border-card/80 flex items-center gap-4 hover:shadow-sm transition-shadow opacity-50">
              <div className="w-12 h-12 bg-muted/10 rounded-xl flex items-center justify-center text-muted text-xs">
                 <History className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                 <h6 className="text-[10px] font-bold text-muted uppercase tracking-widest">Diagnostic History</h6>
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Result saved successfully</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

