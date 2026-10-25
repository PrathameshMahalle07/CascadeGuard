import React, { useState, useMemo } from 'react';
import { ServiceId, WhatIfParams } from '../../domain/types';
import { runWhatIfSimulation } from '../../engine/whatIf';
import { SCENARIO_LIST } from '../../domain/scenarios';
import { SERVICES } from '../../domain/services';
import { Card } from '../primitives/Card';
import {
  Sliders,
  Flame,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const WhatIfLabView: React.FC = () => {
  const [scenarioId, setScenarioId] = useState<string>('database-latency');
  const [params, setParams] = useState<WhatIfParams>({
    failureSeverity: 0.85,
    trafficLoadMultiplier: 1.5,
    retryMultiplier: 2.0,
    circuitBreakerEnabled: false,
    selectedStrategyId: 'db-failover',
  });

  const currentScenario = useMemo(
    () => SCENARIO_LIST.find((s) => s.id === scenarioId) || SCENARIO_LIST[0],
    [scenarioId]
  );

  const whatIfResult = useMemo(() => {
    return runWhatIfSimulation(currentScenario.origin, scenarioId, params);
  }, [currentScenario.origin, scenarioId, params]);

  const resetDefaults = () => {
    setParams({
      failureSeverity: currentScenario.defaultSeverity,
      trafficLoadMultiplier: 1.0,
      retryMultiplier: 1.0,
      circuitBreakerEnabled: false,
      selectedStrategyId: currentScenario.strategies[0]?.id || 'db-failover',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-white/[0.035] border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-2 border-b border-white/6">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#67E8F9]" />
            <h3 className="text-[14px] font-semibold text-[#F5F7FA]">
              Counterfactual What-If Simulation Lab
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetDefaults}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/4 border border-white/8 text-[11px] font-mono-tech text-[#BCC4CF] hover:text-[#F5F7FA]"
            >
              <RotateCcw size={12} />
              <span>Reset Parameters</span>
            </button>
            <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[#67E8F9]">
              PURE ENGINE MODEL
            </span>
          </div>
        </div>
        <p className="text-[12px] text-[#BCC4CF]">
          Simulate counterfactual telemetry conditions in real time. Adjust ingress traffic load, client retry amplification, and circuit breakers to model failure propagation before committing operational policies.
        </p>
      </Card>

      {/* Main Grid: Controls on Left, Dynamic Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Sliders & Configuration (Cols 1-6) */}
        <Card className="lg:col-span-6 p-3.5 sm:p-4 bg-white/[0.035] border-white/8 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/6 min-w-0">
            <span className="text-[10.5px] sm:text-[11px] font-mono-tech uppercase font-semibold text-[#8E99A8]">
              Simulation Parameters
            </span>
            {/* Scenario Picker */}
            <select
              value={scenarioId}
              onChange={(e) => {
                setScenarioId(e.target.value);
                const s = SCENARIO_LIST.find((sc) => sc.id === e.target.value);
                if (s) {
                  setParams((prev) => ({
                    ...prev,
                    failureSeverity: s.defaultSeverity,
                    selectedStrategyId: s.strategies[0]?.id || 'db-failover',
                  }));
                }
              }}
              className="bg-black/35 text-[#F5F7FA] text-[11px] font-mono-tech border border-white/10 rounded px-2 py-1 max-w-[170px] xs:max-w-[210px] sm:max-w-none truncate"
            >
              {SCENARIO_LIST.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Failure Severity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11.5px] font-mono-tech">
              <span className="text-[#BCC4CF]">Origin Failure Severity:</span>
              <span className="font-bold text-[#E5584F]">{Math.round(params.failureSeverity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.05"
              value={params.failureSeverity}
              onChange={(e) => setParams({ ...params, failureSeverity: parseFloat(e.target.value) })}
              className="w-full accent-[#67E8F9] cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] font-mono-tech text-[#7F8A99]">
              <span>30% Low</span>
              <span>75% High</span>
              <span>100% Catastrophic</span>
            </div>
          </div>

          {/* Slider 2: Ingress Traffic Load */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11.5px] font-mono-tech">
              <span className="text-[#BCC4CF]">Ingress Traffic Multiplier:</span>
              <span className="font-bold text-[#67E8F9]">{params.trafficLoadMultiplier.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={params.trafficLoadMultiplier}
              onChange={(e) => setParams({ ...params, trafficLoadMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-[#67E8F9] cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] font-mono-tech text-[#7F8A99]">
              <span>0.5× Off-Peak</span>
              <span>1.0× Nominal</span>
              <span>3.0× Peak Surge</span>
            </div>
          </div>

          {/* Slider 3: Retry Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11.5px] font-mono-tech">
              <span className="text-[#BCC4CF]">Client Retry Storm Multiplier:</span>
              <span className="font-bold text-[#E3A33B]">{params.retryMultiplier.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={params.retryMultiplier}
              onChange={(e) => setParams({ ...params, retryMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-[#67E8F9] cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] font-mono-tech text-[#7F8A99]">
              <span>1.0× Linear</span>
              <span>3.0× Exponential</span>
              <span>5.0× Aggressive Storm</span>
            </div>
          </div>

          {/* Toggle 4: Circuit Breaker Policy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-[8px] bg-white/[0.05] border border-white/6 min-w-0">
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[#F5F7FA]">Ingress Circuit Breaker</div>
              <div className="text-[10.5px] text-[#8E99A8] break-words">Trip connection backlog on 500ms timeout threshold</div>
            </div>
            <button
              onClick={() => setParams({ ...params, circuitBreakerEnabled: !params.circuitBreakerEnabled })}
              className={`px-3 py-1.5 rounded text-[10.5px] sm:text-[11px] font-mono-tech uppercase font-bold transition-colors self-start sm:self-auto flex-shrink-0 ${
                params.circuitBreakerEnabled
                  ? 'bg-[#3FB68B]/20 border border-[#3FB68B]/40 text-[#3FB68B]'
                  : 'bg-white/5 border border-white/10 text-[#8E99A8]'
              }`}
            >
              {params.circuitBreakerEnabled ? 'ENABLED (-40% DAMP)' : 'DISABLED'}
            </button>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono-tech uppercase text-[#8E99A8] block">
              Remediation Strategy Under Evaluation:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {currentScenario.strategies.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setParams({ ...params, selectedStrategyId: st.id })}
                  className={`p-2 rounded text-left text-[11.5px] font-mono-tech border flex justify-between items-center transition-colors ${
                    params.selectedStrategyId === st.id
                      ? 'bg-white/[0.09] border-[#67E8F9]/40 text-[#F5F7FA]'
                      : 'bg-white/[0.035] border-white/6 text-[#BCC4CF] hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="truncate pr-2">{st.name}</span>
                  <span className="text-[#67E8F9] flex-shrink-0">{st.recoverySec}s</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: Dynamic Recalculation Output (Cols 7-12) */}
        <Card className="lg:col-span-6 p-4 bg-white/[0.035] border-white/8 flex flex-col justify-between space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/6 min-w-0">
            <span className="text-[11px] font-mono-tech uppercase font-semibold text-[#8E99A8]">
              Dynamic Recalculation Output
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase flex-shrink-0 ${
                whatIfResult.riskLevel === 'CRITICAL'
                  ? 'bg-[#E5584F]/20 text-[#E5584F] border border-[#E5584F]/30'
                  : whatIfResult.riskLevel === 'HIGH'
                  ? 'bg-[#E3A33B]/20 text-[#E3A33B] border border-[#E3A33B]/30'
                  : 'bg-[#3FB68B]/20 text-[#3FB68B] border border-[#3FB68B]/30'
              }`}
            >
              RISK: {whatIfResult.riskLevel} ({whatIfResult.riskScore} pts)
            </span>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono-tech">
            <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Blast Radius</span>
              <span className="text-[17px] sm:text-[20px] font-bold text-[#E5584F] block mt-1">
                {whatIfResult.predictedBlastRadiusCount} / 8
              </span>
              <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] block">Services</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Time to Crit</span>
              <span className="text-[17px] sm:text-[20px] font-bold text-[#E3A33B] block mt-1">
                {whatIfResult.timeToCriticalMin}m
              </span>
              <span className="text-[9px] sm:text-[9.5px] text-[#BCC4CF] block">Horizon</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-[6px] bg-white/[0.05] border border-white/6 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] text-[#8E99A8] uppercase block truncate">Est. Recovery</span>
              <span className="text-[17px] sm:text-[20px] font-bold text-[#67E8F9] block mt-1">
                {whatIfResult.expectedRecoverySec}s
              </span>
              <span className="text-[9.5px] text-[#BCC4CF] block">Duration</span>
            </div>
          </div>

          {/* Affected Services List */}
          <div className="p-3 rounded-[8px] bg-white/[0.05] border border-white/6 space-y-2">
            <span className="text-[10px] font-mono-tech text-[#8E99A8] uppercase block">
              Projected Affected Tiers Under Counterfactuals:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {whatIfResult.affectedServices.map((id, idx) => {
                const sName = SERVICES[id]?.name || id;
                const isOrigin = id === currentScenario.origin;
                return (
                  <span
                    key={id}
                    className={`px-2 py-1 rounded text-[11px] font-mono-tech flex items-center gap-1.5 border ${
                      isOrigin
                        ? 'bg-[#E5584F]/15 border-[#E5584F]/40 text-[#E5584F] font-bold'
                        : 'bg-[#E3A33B]/10 border-[#E3A33B]/30 text-[#E3A33B]'
                    }`}
                  >
                    <span>{sName}</span>
                    <span className="text-[9px] opacity-75">
                      {isOrigin ? '(Origin)' : `(${Math.round(whatIfResult.cascadeGraph.find((g) => g.serviceId === id)?.probability || 0 * 100)}%)`}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Recommended Mitigation Summary */}
          <div className="p-3 rounded-[8px] bg-black/35 border border-[#67E8F9]/30 space-y-1 text-[11.5px] font-mono-tech">
            <div className="flex items-center gap-1.5 text-[#67E8F9] font-bold uppercase text-[10px]">
              <Sparkles size={11} />
              <span>Recommended Countermeasure</span>
            </div>
            <div className="text-[#F5F7FA] font-medium">{whatIfResult.recommendedMitigation}</div>
            <div className="text-[#BCC4CF] text-[11px]">
              Execution window: {whatIfResult.expectedRecoverySec}s · Avoids {whatIfResult.predictedBlastRadiusCount - 1} downstream service failures.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
