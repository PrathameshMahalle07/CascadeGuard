import React from 'react';
import { AnalysisResult, SimPhase } from '../../domain/types';
import { SERVICES } from '../../domain/services';
import { Card } from '../primitives/Card';
import { StatusGlyph } from '../primitives/StatusGlyph';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface PredictedFailuresProps {
  analysis: AnalysisResult | null;
  phase: SimPhase;
}

export const PredictedFailures: React.FC<PredictedFailuresProps> = ({ analysis, phase }) => {
  const isHealthy = phase === 'healthy';
  const predictions = analysis?.predictedFailures || [];

  return (
    <Card className="p-4 bg-white/[0.035] border-white/8 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-[#67E8F9]" />
          <h3 className="text-[13px] font-semibold text-[#F5F7FA] tracking-tight">
            Predicted Failures
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[10px] font-mono-tech text-[#8E99A8]">
            SIMULATION
          </span>
        </div>
      </div>

      {/* Content */}
      {isHealthy || predictions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-[#8E99A8]">
          <span className="text-[12px] font-mono-tech">No downstream cascades projected.</span>
          <span className="text-[11px] text-[#7F8A99] mt-1">All 8 services within nominal variance bounds.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top Row: Next likely failure banner */}
          <div className="p-2.5 rounded-[6px] bg-[#E3A33B]/10 border border-[#E3A33B]/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#E3A33B]" />
              <span className="text-[11px] font-mono-tech font-bold text-[#E3A33B] uppercase tracking-wide">
                NEXT LIKELY FAILURE: {SERVICES[predictions[0].serviceId]?.name || predictions[0].serviceId}
              </span>
            </div>
            <span className="text-[11px] font-mono-tech text-[#F5F7FA] font-semibold">
              ~{predictions[0].etaMin} min ETA
            </span>
          </div>

          {/* List of predicted failures */}
          <div className="space-y-2.5">
            {predictions.map((p, idx) => {
              const def = SERVICES[p.serviceId];
              const pct = Math.round(p.probability * 100);

              let barColor = 'bg-[#67E8F9]';
              if (pct >= 80) barColor = 'bg-[#E5584F]';
              else if (pct >= 60) barColor = 'bg-[#E3A33B]';

              return (
                <div
                  key={p.serviceId}
                  className="p-2.5 rounded-[6px] bg-white/[0.05] border border-white/6 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusGlyph status={idx === 0 ? 'degraded' : 'at-risk'} size={11} />
                      <span className="text-[12px] font-medium text-[#F5F7FA]">
                        {def?.name || p.serviceId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-mono-tech text-[#BCC4CF]">
                        <Clock size={11} className="text-[#8E99A8]" />
                        ~{p.etaMin} min
                      </span>
                      <span className="text-[12px] font-mono-tech font-bold text-[#F5F7FA]">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-black/35 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-2 mt-2 text-[10px] font-mono-tech text-[#7F8A99] flex justify-between">
        <span>Failure probabilities calculated via dependency propagation weights</span>
      </div>
    </Card>
  );
};
