import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { Card } from '../primitives/Card';
import { IncidentTimeline } from '../panels/IncidentTimeline';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface IncidentsViewProps {
  state: SimState;
  onSelectView: (view: any) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ state, onSelectView }) => {
  const { phase, analysis, timeline } = state;
  const isHealthy = phase === 'healthy';

  return (
    <div className="space-y-4">
      {/* Active Incident Summary */}
      <Card className="p-4 bg-white/[0.035] border-white/8">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={isHealthy ? 'text-[#3FB68B]' : 'text-[#E5584F]'} />
            <h3 className="text-[14px] font-semibold text-[#F5F7FA]">
              {isHealthy ? 'Active Incident Registry (0 Active)' : `Active Incident: ${analysis?.title || 'Fault Injected'}`}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech border border-white/10 bg-white/5 text-[#BCC4CF]">
            SESSION STORE
          </span>
        </div>

        {isHealthy ? (
          <div className="py-8 text-center text-[#8E99A8] space-y-2">
            <CheckCircle size={28} className="text-[#3FB68B] mx-auto opacity-80" />
            <h4 className="text-[13px] font-medium text-[#F5F7FA]">Zero Active Production Incidents</h4>
            <p className="text-[12px] max-w-md mx-auto text-[#8E99A8]">
              Distributed services operating normally. When an incident is triggered or predicted, telemetry fingerprints, root causes, and cascade traces are logged here.
            </p>
            <button
              onClick={() => onSelectView('simulator')}
              className="mt-2 text-[12px] font-mono-tech text-[#67E8F9] hover:underline"
            >
              Open Failure Simulator to inject test scenarios →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-[8px] bg-white/[0.05] border border-[#E5584F]/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono-tech uppercase font-bold text-[#E5584F]">
                  INCIDENT REF: INC-2026-1025-01 · {analysis?.risk.level} RISK
                </div>
                <h4 className="text-[14px] font-semibold text-[#F5F7FA] mt-0.5">
                  {analysis?.rootCause.label}
                </h4>
                <p className="text-[12px] text-[#BCC4CF] mt-1">
                  {analysis?.reasoning.whyThisMatters[0]}
                </p>
              </div>

              <div className="text-right font-mono-tech">
                <div className="text-[10px] text-[#8E99A8]">ROOT CAUSE CONFIDENCE</div>
                <div className="text-[20px] font-bold text-[#67E8F9]">
                  {analysis?.rootCause.confidence}%
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Incident Timeline */}
      <IncidentTimeline timeline={timeline} phase={phase} />
    </div>
  );
};
