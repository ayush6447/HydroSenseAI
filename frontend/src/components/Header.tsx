"use client";

import { Bell, UserCircle, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-12">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-card rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6 text-text" />
        </button>
        <Link href="/" className="text-xl lg:text-2xl font-bold text-hero tracking-tight">HydroSenseAI</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === '/' ? 'text-text border-b-2 border-accent pb-1' : 'text-muted hover:text-text'}`}>Dashboard</Link>
          <Link href="/farms" className={`text-sm font-semibold transition-colors ${pathname === '/farms' ? 'text-text border-b-2 border-accent pb-1' : 'text-muted hover:text-text'}`}>Farms</Link>
          <Link href="/fleet" className={`text-sm font-semibold transition-colors ${pathname === '/fleet' ? 'text-text border-b-2 border-accent pb-1' : 'text-muted hover:text-text'}`}>Fleet</Link>
        </nav>
      </div>


      <div className="flex items-center gap-3 lg:gap-6">
        <div className="relative p-2 rounded-full hover:bg-card transition-colors cursor-pointer">
          <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-text" />
          <div className="absolute top-2.5 right-2.5 w-1.5 lg:w-2 h-1.5 lg:h-2 bg-red-500 rounded-full border-2 border-background" />
        </div>
        <div className="p-1 rounded-full border-2 border-card hover:border-accent transition-colors cursor-pointer">
          <UserCircle className="w-7 lg:w-8 h-7 lg:h-8 text-text" />
        </div>
      </div>
    </header>
  );
}
