import React from 'react';

interface StatusHudProps {
  status: 'GREEN' | 'YELLOW' | 'RED';
}

const statusColors = {
  GREEN: 'bg-green-500 shadow-green-500/50',
  YELLOW: 'bg-yellow-400 shadow-yellow-400/50',
  RED: 'bg-red-500 shadow-red-500/50',
};

const StatusHud: React.FC<StatusHudProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-theme-3 rounded-2xl shadow-sm border border-theme-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">System Health</h2>
      <div 
        className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-all duration-500 animate-pulse ${statusColors[status]}`}
      >
        {status}
      </div>
    </div>
  );
};

export default StatusHud;
