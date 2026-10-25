import React from 'react';
import { SimState } from '../../sim/useSimulation';
import { SCENARIO_LIST } from '../../domain/scenarios';
import { SERVICES } from '../../domain/services';
import { Card } from '../primitives/Card';
import { PhysicalButton } from '../primitives/PhysicalButton';
import { PlayCircle, Flame, AlertCircle, ArrowRight } from 'lucide-react';
import { SeverityLevel } from '../../domain/types';

interface SimulatorViewProps {
  state: SimState;
  onScenarioSelect: (id: string) => void;
  onSimulate: () => void;
  onSelectView: (view: any) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  state,
  onScenarioSelect,
  onSimulate,
  onSelectView,
}) => {
  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <Card className="p-4 bg-white/[0.035] border-white/8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#F5F7FA]">
              Fault Injection Matrix
            </h3>
            <p className="text-[12px] text-[#BCC4CF] mt-0.5">
              Simulate deterministic failure patterns across the distributed service mesh. Each scenario triggers graph-based backward cascade propagation.
            </p>
          </div>
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#67E8F9]">
            4 TEST SUITES
          </span>
        </div>
      </Card>

      {/* 4 Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SCENARIO_LIST.map((scen) => {
          const isSelected = state.scenarioId === scen.id;
          const originService = SERVICES[scen.origin];

          return (
            <Card
              key={scen.id}
              className={`p-4 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white/[0.05] border-[#67E8F9]/40 shadow-[0_0_16px_rgba(103,232,249,0.06)]'
                  : 'bg-white/[0.035] border-white/8 hover:border-white/14'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/6">
                  <span className="text-[10px] font-mono-tech font-bold uppercase text-[#67E8F9]">
                    Origin: {originService?.name || scen.origin}
                  </span>
                  <span className="text-[10px] font-mono-tech text-[#8E99A8]">
                    Default Sev: {Math.round(scen.defaultSeverity * 100)}%
                  </span>
                </div>

                <h4 className="text-[14px] font-semibold text-[#F5F7FA]">
                  {scen.name}
                </h4>
                <p className="text-[12px] text-[#BCC4CF] mt-1.5 leading-relaxed">
                  {scen.description}
                </p>

                {/* Blast Radius Preview */}
                <div className="mt-3 p-2 rounded-[6px] bg-black/35 border border-white/6 text-[11px] font-mono-tech">
                  <div className="flex items-center gap-1.5 text-[#E3A33B] font-semibold mb-1">
                    <Flame size={12} />
                    <span>Projected Blast Radius:</span>
                  </div>
                  <div className="text-[#BCC4CF]">{scen.impactSummary}</div>
                </div>

                {/* Strategies Preview */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-mono-tech text-[#8E99A8] uppercase block">
                    Remediation Strategies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {scen.strategies.map((st) => (
                      <span
                        key={st.id}
                        className="px-2 py-0.5 rounded bg-white/4 text-[10px] font-mono-tech text-[#BCC4CF]"
                      >
                        {st.name} ({st.recoverySec}s)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onScenarioSelect(scen.id)}
                  className={`text-[11px] font-mono-tech ${
                    isSelected ? 'text-[#67E8F9] font-bold' : 'text-[#8E99A8] hover:text-[#BCC4CF]'
                  }`}
                >
                  {isSelected ? '✓ Active Selection' : 'Select Target'}
                </button>

                <PhysicalButton
                  variant="simulate"
                  disabled={state.phase !== 'healthy'}
                  onClick={() => {
                    onScenarioSelect(scen.id);
                    onSimulate();
                    onSelectView('overview');
                  }}
                  icon={<AlertCircle size={13} className="text-[#E3A33B]" />}
                >
                  Simulate Fault
                </PhysicalButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
