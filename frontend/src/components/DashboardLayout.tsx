"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>

        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 px-6 lg:px-10 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
