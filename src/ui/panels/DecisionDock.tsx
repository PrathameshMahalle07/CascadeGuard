import React from 'react';
import { AnalysisResult, SimPhase } from '../../domain/types';
import { PhysicalButton } from '../primitives/PhysicalButton';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface DecisionDockProps {
  analysis: AnalysisResult | null;
  phase: SimPhase;
  selectedStrategyId: string | null;
  onExecuteRecovery: () => void;
  onReset: () => void;
}

export const DecisionDock: React.FC<DecisionDockProps> = ({
  analysis,
  phase,
  selectedStrategyId,
  onExecuteRecovery,
  onReset,
}) => {
  // Only show when in incident or resolved
  if (phase === 'healthy' || !analysis) {
    return null;
  }

  const selectedStrategy =
    analysis.strategies.find((s) => s.id === (selectedStrategyId || analysis.recommendedStrategyId)) ||
    analysis.strategies[0];

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[95%] sm:w-auto px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] glass glass--strong shadow-[0_0_0_1px_rgba(103,232,249,0.3),0_0_44px_-6px_rgba(103,232,249,0.45),0_24px_50px_-12px_rgba(0,0,0,0.75)]">
        {phase === 'resolved' ? (
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3FB68B]" />
              <div className="text-[11.5px] sm:text-[12px] font-mono-tech text-[#F5F7FA]">
                System Recovered <span className="text-[#3FB68B] font-bold">98.4%</span>
              </div>
            </div>
            <PhysicalButton variant="secondary" onClick={onReset} shortcut="R">
              Reset Baseline
            </PhysicalButton>
          </div>
        ) : phase === 'recovering' ? (
          <div className="flex items-center gap-2 sm:gap-3 text-[11.5px] sm:text-[12px] font-mono-tech text-[#67E8F9]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#67E8F9] animate-ping flex-shrink-0" />
            <span>Remediation in flight...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] font-mono-tech text-[#BCC4CF] min-w-0">
              <span className="px-1.5 py-0.5 rounded bg-[#67E8F9]/15 text-[#67E8F9] font-bold uppercase text-[9.5px] sm:text-[10px] flex items-center gap-1 flex-shrink-0">
                <Sparkles size={10} />
                Action
              </span>
              <span className="font-medium text-[#F5F7FA] truncate max-w-[170px] sm:max-w-none">{selectedStrategy?.name}</span>
              <span className="text-[#8E99A8]">·</span>
              <span className="text-[#67E8F9] font-semibold">{selectedStrategy?.recoverySec}s</span>
              <span className="text-[#8E99A8]">·</span>
              <span className="text-[#3FB68B] uppercase">{selectedStrategy?.risk}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <PhysicalButton
                variant="recovery"
                onClick={onExecuteRecovery}
                shortcut="Ctrl+E"
                icon={<ShieldCheck size={14} className="text-[#06222A]" />}
                className="flex-1 sm:flex-none justify-center"
              >
                Execute Recovery
              </PhysicalButton>
              <PhysicalButton
                variant="secondary"
                onClick={onReset}
                shortcut="Ctrl+Shift+R"
                className="flex-shrink-0"
              >
                Reset
              </PhysicalButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
