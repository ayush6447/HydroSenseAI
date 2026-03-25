"use client";

import { LayoutDashboard, TrendingUp, Microscope, Settings, LifeBuoy, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: TrendingUp, label: "Analytics", href: "/analytics" },
    { icon: Microscope, label: "AI Diagnostics", href: "/diagnostics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-hero/20 backdrop-blur-sm z-[55] transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar flex flex-col p-6 border-r border-card z-[60] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-start mb-10">

          <div>
            <h1 className="text-xl font-bold text-hero tracking-tight">Precision Organics</h1>
            <p className="text-[10px] uppercase font-bold text-muted tracking-widest mt-1">AI ORCHESTRATOR</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-white/40 rounded-lg text-hero">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                pathname === item.href 
                ? 'bg-[#E3EBE3] text-accent font-black' 
                : 'text-muted hover:bg-white/40'
              }`}
              onClick={onClose}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>


        <div className="mt-auto space-y-6">
          <div className="bg-[#E3EBE3] p-4 rounded-xl border border-card shadow-sm">
             <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">System Health</div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-bold text-text">System Health: Optimal</span>
             </div>
          </div>
        </div>
      </aside>

    </>
  );
}

