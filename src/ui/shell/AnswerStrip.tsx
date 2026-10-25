import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { Card } from '../primitives/Card';
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

interface AnswerStripProps {
  state: SimState;
}

export const AnswerStrip: React.FC<AnswerStripProps> = ({ state }) => {
  const { phase, services, analysis, selectedStrategyId, recoveryStepText, resolvedSummary } = state;

  const originService = analysis?.rootCause.serviceId ? services[analysis.rootCause.serviceId] : services.database;
  const nextTarget = analysis?.predictedFailures[0];
  const nextServiceName = nextTarget ? services[nextTarget.serviceId]?.name : 'Payment Service';
  const selectedStrategy = analysis?.strategies.find((s) => s.id === selectedStrategyId) || analysis?.strategies[0];

  // Derive text for the 5 steps
  let happeningText = 'All 8 services nominal';
  let nextText = 'No failures predicted';
  let whyText = 'Dependency health within baseline';
  let actionText = 'None required';
  let resultText = 'No incident';

  let activeIndex = 0; // 0=healthy, 1=happening, 2=next, 3=why, 4=action, 5=result

  if (phase === 'injecting' || phase === 'analyzing') {
    activeIndex = phase === 'injecting' ? 1 : 2;
    happeningText = `${originService.name} latency climbing (${originService.currentP95}ms)`;
    nextText = `Correlating telemetry with dependency graph`;
    whyText = `Query thread saturation detected at origin`;
    actionText = `AI ranking mitigation strategies`;
    resultText = `Cascade prediction in progress`;
  } else if (phase === 'incident') {
    activeIndex = 4;
    happeningText = `${analysis?.rootCause.label || 'Origin fault'}, ${originService.currentP95} ms`;
    nextText = `${nextServiceName} likely fails in ~${nextTarget?.etaMin || 4} min (${Math.round((nextTarget?.probability || 0.82) * 100)}%)`;
    whyText = `${nextServiceName} blocks on ${originService.name} queries and retries add cascading load`;
    actionText = `${selectedStrategy?.name || 'Failover'}, ${selectedStrategy?.recoverySec || 42}s, ${selectedStrategy?.risk || 'low'} risk`;
    resultText = 'Awaiting your execution decision';
  } else if (phase === 'recovering') {
    activeIndex = 4;
    happeningText = `${analysis?.rootCause.label || 'Incident in recovery'}`;
    nextText = `Cascade vector intercepted`;
    whyText = `Routing away from degraded node`;
    actionText = recoveryStepText || 'Executing recovery steps';
    resultText = `Services stabilizing`;
  } else if (phase === 'resolved') {
    activeIndex = 5;
    happeningText = 'Incident resolved';
    nextText = 'Cascade risk LOW';
    whyText = `${selectedStrategy?.name || 'Failover'} restored query latency to ${originService.currentP95} ms`;
    actionText = `${selectedStrategy?.name || 'Recovery'} executed`;
    resultText = resolvedSummary || 'Payment failure averted, recovered in 42 s (simulated)';
  }

  const steps = [
    { label: 'HAPPENING', text: happeningText, stepNum: 1 },
    { label: 'NEXT', text: nextText, stepNum: 2 },
    { label: 'WHY', text: whyText, stepNum: 3 },
    { label: 'ACTION', text: actionText, stepNum: 4 },
    { label: 'RESULT', text: resultText, stepNum: 5 },
  ];

  return (
    <Card className="px-3 sm:px-4 py-2.5 sm:py-3 border border-white/8 backdrop-blur min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Activity size={13} className="text-[#67E8F9] flex-shrink-0" />
          <span className="text-[10.5px] sm:text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#BCC4CF] truncate">
            Incident Comprehension Strip
          </span>
        </div>
        <div className="text-[10px] font-mono-tech text-[#8E99A8] flex items-center gap-1.5 flex-shrink-0">
          <span className="hidden sm:inline">TEN-SECOND SRE CAUSALITY CHAIN</span>
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#67E8F9]">
            {phase.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-2.5">
        {steps.map((step, idx) => {
          const isCurrent = (phase === 'healthy' && idx === 0) || (idx + 1 === activeIndex);
          const isPast = (phase === 'resolved') || (idx + 1 < activeIndex);

          let stepBg = 'bg-white/[0.04] border-white/5 text-[#8E99A8]';
          let indicatorBg = 'bg-white/10 text-[#8E99A8]';
          let labelColor = 'text-[#8E99A8]';
          let textColor = 'text-[#BCC4CF]';

          if (isCurrent) {
            stepBg = 'bg-white/[0.09] border-[#67E8F9]/30 text-[#F5F7FA] shadow-[0_0_26px_rgba(103,232,249,0.2)]';
            indicatorBg = 'bg-[#67E8F9] text-[#06222A] font-bold';
            labelColor = 'text-[#67E8F9]';
            textColor = 'text-[#F5F7FA]';
          } else if (isPast) {
            stepBg = 'bg-white/[0.05] border-white/10 text-[#BCC4CF]';
            indicatorBg = 'bg-[#3FB68B]/20 text-[#3FB68B] font-medium';
            labelColor = 'text-[#3FB68B]';
            textColor = 'text-[#F5F7FA]';
          }

          return (
            <div
              key={step.label}
              className={`p-2.5 rounded-[8px] border transition-all duration-200 flex flex-col justify-between min-h-[60px] sm:min-h-[66px] min-w-0 ${stepBg}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] font-mono-tech font-bold tracking-wider uppercase ${labelColor}`}>
                  {step.label}
                </span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono-tech flex-shrink-0 ${indicatorBg}`}>
                  {isPast ? '✓' : step.stepNum}
                </span>
              </div>
              <p className={`text-[11.5px] sm:text-[12px] leading-tight font-medium line-clamp-2 break-words ${textColor}`}>
                {step.text}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
