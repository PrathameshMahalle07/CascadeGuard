import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { Card } from '../primitives/Card';
import { AnalyticsCharts } from '../panels/AnalyticsCharts';
import { BarChart2, Activity, Cpu } from 'lucide-react';

interface AnalyticsViewProps {
  state: SimState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white/[0.035] border-white/8">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/6">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-[#67E8F9]" />
            <h3 className="text-[14px] font-semibold text-[#F5F7FA]">
              Full-Spectrum SRE Telemetry & Anomaly Analytics
            </h3>
          </div>
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#8E99A8]">
            90-POINT ROLLING BUFFER
          </span>
        </div>
        <p className="text-[12px] text-[#BCC4CF]">
          Time-series telemetry sampled at 1Hz across synthetic probes. Graph-weighted failure probabilities correlate real-time upstream saturation with downstream SLA impact.
        </p>
      </Card>

      {/* 4 Full Size Charts */}
      <AnalyticsCharts
        metrics={state.metricsHistory}
        services={state.services}
        fullSize={true}
      />
    </div>
  );
};
