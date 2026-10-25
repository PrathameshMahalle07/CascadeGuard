import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { Card } from '../primitives/Card';
import { RecoveryStrategies } from '../panels/RecoveryStrategies';
import { ShieldCheck, PlayCircle, ArrowRight } from 'lucide-react';

interface RecoveryViewProps {
  state: SimState;
  onSelectStrategy: (id: string) => void;
  onExecuteRecovery: () => void;
  onSelectView: (view: any) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({
  state,
  onSelectStrategy,
  onExecuteRecovery,
  onSelectView,
}) => {
  const { phase, analysis, selectedStrategyId } = state;
  const isHealthy = phase === 'healthy';

  if (isHealthy) {
    return (
      <Card className="p-8 bg-white/[0.035] border-white/8 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#3FB68B]/10 border border-[#3FB68B]/30 flex items-center justify-center mx-auto text-[#3FB68B]">
          <ShieldCheck size={24} />
        </div>
        <h3 className="text-[16px] font-semibold text-[#F5F7FA]">
          All Systems Operational · Recovery Idle
        </h3>
        <p className="text-[12.5px] text-[#8E99A8] leading-relaxed max-w-md mx-auto">
          The remediation engine evaluates trade-offs between failover speed, downstream impact, and risk when active anomalies are predicted.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onSelectView('simulator')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-white/[0.05] border border-white/10 text-[12px] font-mono-tech text-[#67E8F9] hover:bg-white/[0.09] transition-colors"
          >
            <PlayCircle size={14} />
            <span>Launch Failure Simulator</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <RecoveryStrategies
        analysis={analysis}
        phase={phase}
        selectedStrategyId={selectedStrategyId}
        onSelectStrategy={onSelectStrategy}
        onExecuteRecovery={onExecuteRecovery}
      />
    </div>
  );
};
