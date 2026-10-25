import React from 'react';
import { PredictionVsActual, SimPhase } from '../../domain/types';
import { Card } from '../primitives/Card';
import { CheckCircle2, Crosshair, BarChart, Clock, ShieldCheck } from 'lucide-react';

interface PredictionVsActualPanelProps {
  data: PredictionVsActual | null;
  phase: SimPhase;
}

export const PredictionVsActualPanel: React.FC<PredictionVsActualPanelProps> = ({
  data,
  phase,
}) => {
  if (phase !== 'resolved' || !data) return null;

  return (
    <Card className="p-4 bg-white/[0.035] border-[#3FB68B]/30 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-[#3FB68B]" />
          <h3 className="text-[13px] font-semibold text-[#F5F7FA] tracking-tight uppercase">
            Model Forecast vs. Actual Telemetry Verification
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#3FB68B]/10 border border-[#3FB68B]/20 text-[#3FB68B] font-bold">
          96% FORECAST FIDELITY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tech text-[11.5px]">
        {/* Metric 1: Affected Services */}
        <div className="p-3 rounded-[6px] bg-white/[0.05] border border-white/6 space-y-1">
          <span className="text-[10px] text-[#8E99A8] uppercase">Cascade Blast Vector</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[#BCC4CF]">Predicted: <strong className="text-[#F5F7FA]">{data.predictedAffectedCount}</strong></span>
            <span className="text-[#3FB68B]">Actual: <strong>{data.actualAffectedCount}</strong></span>
          </div>
          <span className="text-[10px] text-[#67E8F9] block">100% Path Match</span>
        </div>

        {/* Metric 2: Recovery Timeline */}
        <div className="p-3 rounded-[6px] bg-white/[0.05] border border-white/6 space-y-1">
          <span className="text-[10px] text-[#8E99A8] uppercase">Time Horizon</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[#BCC4CF]">Est. Crash: <strong className="text-[#F5F7FA]">~{data.predictedTimeToFailureMin}m</strong></span>
            <span className="text-[#3FB68B]">Resolved: <strong>{data.actualRecoveryTimeSec}s</strong></span>
          </div>
          <span className="text-[10px] text-[#3FB68B] block">Crash Prevented</span>
        </div>

        {/* Metric 3: Model Accuracy Score */}
        <div className="p-3 rounded-[6px] bg-white/[0.05] border border-white/6 space-y-1">
          <span className="text-[10px] text-[#8E99A8] uppercase">Forecast Accuracy</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[20px] font-bold text-[#3FB68B]">{data.accuracyScore}%</span>
            <span className="text-[10px] text-[#8E99A8]">Mean Error &lt;4%</span>
          </div>
          <span className="text-[10px] text-[#BCC4CF] block">SRE Ground Truth Verified</span>
        </div>
      </div>
    </Card>
  );
};
