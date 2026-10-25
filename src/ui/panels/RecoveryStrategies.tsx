import React from 'react';
import { AnalysisResult, SimPhase, ImpactLevel } from '../../domain/types';
import { Card } from '../primitives/Card';
import { PhysicalButton } from '../primitives/PhysicalButton';
import { ShieldCheck, Check, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface RecoveryStrategiesProps {
  analysis: AnalysisResult | null;
  phase: SimPhase;
  selectedStrategyId: string | null;
  onSelectStrategy: (id: string) => void;
  onExecuteRecovery: () => void;
}

const PipMeter: React.FC<{ level: ImpactLevel; label: string }> = ({ level, label }) => {
  const pips = level === 'low' ? 1 : level === 'medium' ? 2 : 3;
  const color = level === 'low' ? 'bg-[#3FB68B]' : level === 'medium' ? 'bg-[#E3A33B]' : 'bg-[#E5584F]';

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono-tech">
      <span className="text-[#8E99A8]">{label}:</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((pip) => (
          <span
            key={pip}
            className={`w-1.5 h-3 rounded-[1px] ${
              pip <= pips ? color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className="text-[#BCC4CF] uppercase text-[9.5px] font-medium">{level}</span>
    </div>
  );
};

export const RecoveryStrategies: React.FC<RecoveryStrategiesProps> = ({
  analysis,
  phase,
  selectedStrategyId,
  onSelectStrategy,
  onExecuteRecovery,
}) => {
  const isHealthy = phase === 'healthy';
  const strategies = analysis?.strategies || [];
  const recommendedId = analysis?.recommendedStrategyId || strategies[0]?.id;
  const activeStrategy = strategies.find((s) => s.id === (selectedStrategyId || recommendedId));

  return (
    <Card className="p-4 bg-white/[0.035] border-white/8 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#67E8F9]" />
            <h3 className="text-[13px] font-semibold text-[#F5F7FA] tracking-tight">
              Recovery Strategies
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono-tech text-[#8E99A8]">
            <span>WEIGHTS: SPEED 40 · IMPACT 35 · RISK 25</span>
          </div>
        </div>

        {/* Content */}
        {isHealthy || strategies.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-[#8E99A8]">
            <span className="text-[12px] font-mono-tech">No active remediation needed.</span>
            <span className="text-[11px] text-[#7F8A99] mt-1">System is nominal. Strategies will rank upon anomaly detection.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {strategies.map((strat) => {
              const isRec = strat.id === recommendedId;
              const isSelected = (selectedStrategyId || recommendedId) === strat.id;

              return (
                <div
                  key={strat.id}
                  onClick={() => onSelectStrategy(strat.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`p-3 rounded-[8px] border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-white/[0.05] border-[#67E8F9]/50 shadow-[0_0_12px_rgba(103,232,249,0.06)]'
                      : 'bg-white/[0.035] border-white/6 hover:border-white/12 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#F5F7FA]">
                          {strat.name}
                        </span>
                        {isRec && (
                          <span className="px-1.5 py-0.5 rounded bg-[#67E8F9]/15 border border-[#67E8F9]/30 text-[9.5px] font-mono-tech font-bold text-[#67E8F9] flex items-center gap-1">
                            <Sparkles size={9} />
                            AI RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#BCC4CF] leading-snug">
                        {strat.rationale}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-mono-tech font-bold text-[#F5F7FA]">
                        {strat.score} <span className="text-[10px] text-[#8E99A8]">pts</span>
                      </div>
                      <div className="text-[11px] font-mono-tech text-[#67E8F9]">
                        {strat.recoverySec}s
                      </div>
                    </div>
                  </div>

                  {/* Meters Row */}
                  <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-white/6">
                    <PipMeter level={strat.risk} label="Risk" />
                    <PipMeter level={strat.impact} label="Downstream Impact" />
                  </div>

                  {/* Factual Trade-off note when selected */}
                  {isSelected && strat.tradeoffNote && (
                    <div className="mt-2 p-1.5 rounded bg-black/35 border border-white/6 text-[10.5px] font-mono-tech text-[#BCC4CF]">
                      <span className="text-[#67E8F9] font-medium">Trade-off: </span>
                      {strat.tradeoffNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Execute Recovery Action Footer */}
      {!isHealthy && strategies.length > 0 && (
        <div className="pt-3.5 mt-3.5 border-t border-white/6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8E99A8]">
            <span>Selected Strategy:</span>
            <span className="text-[#F5F7FA] font-medium">
              {activeStrategy?.name} ({activeStrategy?.recoverySec}s)
            </span>
          </div>

          <PhysicalButton
            variant="recovery"
            size="lg"
            className="w-full"
            disabled={phase === 'recovering' || phase === 'resolved'}
            onClick={onExecuteRecovery}
            shortcut="Ctrl+E"
            icon={<ShieldCheck size={16} className="text-[#06222A]" />}
          >
            {phase === 'recovering'
              ? 'Executing Recovery...'
              : phase === 'resolved'
              ? 'System Recovered'
              : 'Execute Recovery'}
          </PhysicalButton>
        </div>
      )}
    </Card>
  );
};
