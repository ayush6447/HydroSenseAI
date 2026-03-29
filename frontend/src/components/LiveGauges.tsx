import React from 'react';

interface GaugesProps {
  ph: number;
  tds: number;
}

const LiveGauges: React.FC<GaugesProps> = ({ ph, tds }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-theme-4 rounded-xl p-4 flex flex-col items-center justify-center border border-theme-5 shadow-sm">
        <h3 className="text-lg font-medium text-theme-5 mb-2">pH Level</h3>
        <div className="text-4xl font-black text-gray-800">{ph.toFixed(1)}</div>
      </div>
      <div className="bg-theme-4 rounded-xl p-4 flex flex-col items-center justify-center border border-theme-5 shadow-sm">
        <h3 className="text-lg font-medium text-theme-5 mb-2">TDS</h3>
        <div className="text-4xl font-black text-gray-800">{tds.toFixed(0)}</div>
      </div>
    </div>
  );
};

export default LiveGauges;
