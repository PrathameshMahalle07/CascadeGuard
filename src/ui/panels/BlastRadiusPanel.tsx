import React from 'react';
import { BlastRadiusMetrics, SimPhase } from '../../domain/types';
import { Card } from '../primitives/Card';
import { Flame, ShieldCheck, ArrowRight, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';

interface BlastRadiusPanelProps {
  metrics: BlastRadiusMetrics | null;
  phase: SimPhase;
}

export const BlastRadiusPanel: React.FC<BlastRadiusPanelProps> = ({ metrics, phase }) => {
  const isHealthy = phase === 'healthy';

  if (isHealthy || !metrics) {
    return (
      <Card className="p-4 bg-white/[0.035] border-white/8 flex flex-col justify-center items-center text-center h-full min-h-[220px]">
        <ShieldCheck size={22} className="text-[#3FB68B] mb-2" />
        <h4 className="text-[13px] font-medium text-[#F5F7FA]">Blast Radius Analysis</h4>
        <p className="text-[11.5px] text-[#8E99A8] max-w-xs mt-1">
          Zero active containment required. Blast radius differential activates automatically during simulated incidents.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3.5 sm:p-4 bg-white/[0.035] border-white/8 space-y-3.5 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/6 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Flame size={15} className="text-[#E3A33B] flex-shrink-0" />
          <h3 className="text-[12.5px] sm:text-[13px] font-semibold text-[#F5F7FA] tracking-tight uppercase truncate">
            Blast Radius Containment Analysis
          </h3>
        </div>
        <span className="text-[9.5px] sm:text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#67E8F9] flex-shrink-0">
          COUNTERFACTUAL COMPARISON
        </span>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-tech text-center">
        <div className="p-2 sm:p-2.5 rounded-[6px] bg-[#3FB68B]/10 border border-[#3FB68B]/25 min-w-0">
          <span className="text-[18px] sm:text-[20px] font-bold text-[#3FB68B] block leading-tight">
            {metrics.blastRadiusAvoidedPct}%
          </span>
          <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] uppercase tracking-wider block mt-0.5 truncate">
            Blast Radius Avoided
          </span>
        </div>

        <div className="p-2 sm:p-2.5 rounded-[6px] bg-[#67E8F9]/10 border border-[#67E8F9]/25 min-w-0">
          <span className="text-[18px] sm:text-[20px] font-bold text-[#67E8F9] block leading-tight">
            {metrics.servicesProtected}
          </span>
          <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] uppercase tracking-wider block mt-0.5 truncate">
            Services Protected
          </span>
        </div>

        <div className="p-2 sm:p-2.5 rounded-[6px] bg-white/5 border border-white/8 min-w-0">
          <span className="text-[12.5px] sm:text-[14px] font-bold text-[#F5F7FA] block leading-tight mt-1 truncate">
            {metrics.timeSavedText}
          </span>
          <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] uppercase tracking-wider block mt-1 truncate">
            Time to Recovery
          </span>
        </div>

        <div className="p-2 sm:p-2.5 rounded-[6px] bg-[#E3A33B]/10 border border-[#E3A33B]/25 min-w-0">
          <span className="text-[18px] sm:text-[20px] font-bold text-[#E3A33B] block leading-tight">
            {metrics.userImpactReductionPct}%
          </span>
          <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] uppercase tracking-wider block mt-0.5 truncate">
            Impact Reduction
          </span>
        </div>
      </div>

      {/* Side-by-Side Visual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Without Intervention */}
        <div className="p-3 rounded-[8px] bg-white/[0.05] border border-[#E5584F]/30 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-tech font-bold text-[#E5584F] uppercase">
            <XCircle size={13} />
            <span>Without Intervention (Unmitigated)</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tech">
            {metrics.unmitigatedPath.map((node, i) => (
              <React.Fragment key={i}>
                <span className="px-2 py-0.5 rounded bg-[#E5584F]/15 border border-[#E5584F]/30 text-[#E5584F]">
                  {node}
                </span>
                {i < metrics.unmitigatedPath.length - 1 && (
                  <ArrowRight size={11} className="text-[#E5584F]/60" />
                )}
              </React.Fragment>
            ))}
          </div>
          <span className="text-[10.5px] text-[#BCC4CF] block leading-snug">
            Cascade propagates unhindered until ingress gateway connection pool crashes entirely.
          </span>
        </div>

        {/* With CascadeGuard */}
        <div className="p-3 rounded-[8px] bg-white/[0.05] border border-[#3FB68B]/30 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-tech font-bold text-[#3FB68B] uppercase">
            <CheckCircle2 size={13} />
            <span>With CascadeGuard AI</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tech">
            {metrics.mitigatedPath.map((node, i) => {
              const isProtected = node.includes('(Protected)');
              return (
                <React.Fragment key={i}>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      isProtected
                        ? 'bg-[#3FB68B]/15 border-[#3FB68B]/30 text-[#3FB68B]'
                        : 'bg-white/5 border-white/10 text-[#F5F7FA]'
                    }`}
                  >
                    {node}
                  </span>
                  {i < metrics.mitigatedPath.length - 1 && (
                    <ArrowRight size={11} className="text-[#3FB68B]/60" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <span className="text-[10.5px] text-[#BCC4CF] block leading-snug">
            Automated remediation encapsulates failure at origin, sheltering upstream tiers.
          </span>
        </div>
      </div>
    </Card>
  );
};
