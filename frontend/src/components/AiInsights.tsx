import React from 'react';

interface AIOrchestratorOutput {
  status: string;
  priority_action: string;
  human_escalation: boolean;
}

interface Insights {
  yield_score: number;
  next_ph: number;
  next_tds: number;
}

interface ActuatorState {
  ph_reducer: boolean;
  add_water: boolean;
  nutrients_adder: boolean;
  humidifier: boolean;
  exhaust_fan: boolean;
}

interface AiInsightsProps {
  output: AIOrchestratorOutput;
  insights: Insights;
  actuatorState: ActuatorState;
}

const AiInsights: React.FC<AiInsightsProps> = ({ output, insights, actuatorState }) => {
  return (
    <div className="bg-theme-3 p-6 rounded-2xl shadow-sm border border-theme-4 flex flex-col space-y-6">
      <h2 className="text-xl font-bold text-theme-5 border-b border-theme-4 pb-2">AI Insights & Orchestration</h2>
      
      <div className="bg-white p-4 rounded-xl border-l-4 border-theme-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Priority Action</h3>
        <p className="text-lg font-medium text-gray-800 mt-1">{output.priority_action}</p>
        {output.human_escalation && (
          <span className="inline-block mt-2 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Requires Human Intervention</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-theme-2 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-600">Predicted Yield</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{(insights.yield_score * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-theme-2 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-600">Next State Forecast</h3>
          <p className="text-sm text-gray-800 mt-1">pH: {insights.next_ph.toFixed(2)} | TDS: {insights.next_tds.toFixed(0)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Actuator Status</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(actuatorState).map(([key, isOn]) => (
            <span 
              key={key} 
              className={`text-xs font-semibold px-3 py-1 rounded-full ${isOn ? 'bg-theme-5 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {key.replace('_', ' ').toUpperCase()} {isOn ? 'ON' : 'OFF'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
