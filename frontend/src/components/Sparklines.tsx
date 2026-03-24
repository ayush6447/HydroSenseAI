import React from 'react';

interface Metric {
  name: string;
  value: string | number;
  unit: string;
}

interface SparklinesProps {
  metrics: Metric[];
}

const Sparklines: React.FC<SparklinesProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-theme-2 p-4 rounded-lg shadow-sm flex flex-col items-start border border-theme-1">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{metric.name}</span>
          <span className="text-2xl font-bold mt-1 text-gray-800">
            {metric.value} <span className="text-sm text-gray-500 font-normal">{metric.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default Sparklines;
