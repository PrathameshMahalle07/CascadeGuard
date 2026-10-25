import React, { useState, useEffect } from 'react';
import { useSimulation } from './sim/useSimulation';
import { Sidebar, NavView } from './ui/shell/Sidebar';
import { Header } from './ui/shell/Header';
import { AnswerStrip } from './ui/shell/AnswerStrip';
import { SettingsPopover } from './ui/shell/SettingsPopover';
import { ShortcutManager } from './ui/shell/ShortcutManager';
import { Stat } from './ui/primitives/Stat';
import { PhysicalButton } from './ui/primitives/PhysicalButton';
import { ServiceGraph } from './ui/graph/ServiceGraph';
import { AiIncidentReasoning } from './ui/panels/AiIncidentReasoning';
import { BlastRadiusPanel } from './ui/panels/BlastRadiusPanel';
import { PredictionVsActualPanel } from './ui/panels/PredictionVsActualPanel';
import { PredictedFailures } from './ui/panels/PredictedFailures';
import { RecoveryStrategies } from './ui/panels/RecoveryStrategies';
import { DecisionDock } from './ui/panels/DecisionDock';
import { LiveLogs } from './ui/panels/LiveLogs';
import { IncidentTimeline } from './ui/panels/IncidentTimeline';
import { AnalyticsCharts } from './ui/panels/AnalyticsCharts';

// Views
import { WhatIfLabView } from './ui/views/WhatIfLabView';
import { IncidentReportView } from './ui/views/IncidentReportView';
import { InfrastructureView } from './ui/views/InfrastructureView';
import { IncidentsView } from './ui/views/IncidentsView';
import { SimulatorView } from './ui/views/SimulatorView';
import { RecoveryView } from './ui/views/RecoveryView';
import { AnalyticsView } from './ui/views/AnalyticsView';

import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  Play,
  Sliders,
  Server,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function App() {
  const {
    state,
    settings,
    setSettings,
    dispatch,
    simulateFailure,
    executeRecovery,
    resetSystem,
  } = useSimulation();

  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Apply reduce-motion class to document body if enabled
  useEffect(() => {
    if (settings.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [settings.reduceMotion]);

  // Cinematic Phase Steps
  const phaseSteps = [
    { id: 'healthy', label: 'HEALTHY' },
    { id: 'injecting', label: 'ANOMALY DETECTED' },
    { id: 'incident', label: 'CASCADE IMMINENT' },
    { id: 'recovering', label: 'MITIGATION ACTIVE' },
    { id: 'resolved', label: 'RESOLVED' },
  ];

  const getPhaseStepIndex = () => {
    if (state.phase === 'healthy') return 0;
    if (state.phase === 'injecting' || state.phase === 'analyzing') return 1;
    if (state.phase === 'incident') return 2;
    if (state.phase === 'recovering') return 3;
    if (state.phase === 'resolved') return 4;
    return 0;
  };

  const currentStepIndex = getPhaseStepIndex();

  return (
    <div className="relative isolate min-h-screen text-[#F5F7FA] flex flex-col antialiased selection:bg-[#67E8F9]/20 selection:text-[#67E8F9]">
      {/* Ambient aurora: shifts from calm teal to ember as the incident unfolds */}
      <div className="cg-aurora" data-phase={state.phase} aria-hidden="true">
        <i className="a" /><i className="b" /><i className="c" /><i className="ember" />
      </div>

      {/* Polite Accessibility Live Region */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.announcement}
      </div>

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[64px] xl:pl-[208px] transition-all duration-300">
        {/* Top Header */}
        <Header
          phase={state.phase}
          simClock={state.simClock}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onReset={resetSystem}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-5 pb-24">
          {currentView === 'overview' && (
            <>
              {/* 1. Masthead & Hero Action */}
              <div className="glass glass--hero flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 sm:p-7 rounded-[22px] min-w-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono-tech uppercase font-bold tracking-wider text-[#67E8F9] px-2 py-0.5 rounded bg-[#67E8F9]/10 border border-[#67E8F9]/20 flex-shrink-0">
                      SRE Command Center
                    </span>
                    <span className="text-[10px] font-mono-tech text-[#8E99A8]">
                      Autonomous Reliability Intelligence
                    </span>
                  </div>
                  <h1 className="font-display text-[28px] sm:text-[42px] leading-[1.04] font-[380] tracking-[-0.035em] text-gradient break-words">
                    Predict the cascade. Stop the outage.
                  </h1>
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#BCC4CF] mt-2 max-w-2xl break-words">
                    Real-time failure prediction, root-cause isolation, and counterfactual recovery orchestration for distributed microservice topologies.
                  </p>
                </div>

                {/* Primary Hero Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start lg:self-auto flex-shrink-0">
                  <PhysicalButton
                    variant="simulate"
                    size="lg"
                    disabled={state.phase !== 'healthy'}
                    onClick={simulateFailure}
                    shortcut="Ctrl+R"
                    icon={<Play size={15} className="fill-[#E3A33B] text-[#E3A33B]" />}
                  >
                    {state.phase === 'healthy' ? 'RUN INCIDENT' : 'INCIDENT ACTIVE'}
                  </PhysicalButton>

                  <button
                    onClick={() => setCurrentView('what-if')}
                    className="btn-glass flex items-center gap-2 px-4 py-3 rounded-[13px] text-[12.5px] sm:text-[13px] font-semibold text-[#F5F7FA] cursor-pointer"
                  >
                    <Sliders size={14} className="text-[#67E8F9]" />
                    <span>What-If Lab</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9.5px] font-mono-tech rounded bg-white/5 border border-white/10 text-[#67E8F9]">
                      Ctrl+W
                    </kbd>
                  </button>

                  {state.phase === 'resolved' && (
                    <button
                      onClick={() => setCurrentView('report')}
                      className="flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 btn-glow-ok rounded-[13px] bg-[#3FB68B]/15 border border-[#3FB68B]/40 text-[11.5px] sm:text-[12px] font-mono-tech text-[#3FB68B] font-bold hover:bg-[#3FB68B]/25 transition-all cursor-pointer"
                    >
                      <FileText size={14} />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cinematic Phase Timeline Banner */}
              {/* Mobile Stepper View (<sm) */}
              <div className="sm:hidden flex items-center justify-between p-2.5 rounded-[8px] glass min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      state.phase === 'healthy' || state.phase === 'resolved'
                        ? 'bg-[#3FB68B]'
                        : 'bg-[#67E8F9] animate-ping'
                    }`}
                  />
                  <span className="text-[10px] font-mono-tech text-[#8E99A8] uppercase flex-shrink-0">
                    Phase {currentStepIndex + 1}/5:
                  </span>
                  <span className="text-[11.5px] font-mono-tech font-bold text-[#67E8F9] truncate">
                    {phaseSteps[currentStepIndex].label}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {phaseSteps.map((step, idx) => (
                    <span
                      key={step.id}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? 'w-4 bg-[#67E8F9]'
                          : idx < currentStepIndex
                          ? 'w-2 bg-[#3FB68B]'
                          : 'w-1.5 bg-white/20'
                      }`}
                      title={step.label}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Stepper View (sm+) */}
              <div className="hidden sm:block p-2.5 rounded-[8px] glass overflow-x-auto">
                <div className="flex items-center justify-between min-w-[620px] gap-2 font-mono-tech text-[10px]">
                  {phaseSteps.map((step, idx) => {
                    const isPassed = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <React.Fragment key={step.id}>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border transition-all ${
                            isCurrent
                              ? 'bg-white/[0.09] border-[#67E8F9]/50 text-[#67E8F9] font-bold shadow-[0_0_10px_rgba(103,232,249,0.1)]'
                              : isPassed
                              ? 'bg-white/[0.05] border-white/8 text-[#3FB68B]'
                              : 'bg-transparent border-transparent text-[#7F8A99]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCurrent
                                ? 'bg-[#67E8F9] animate-ping'
                                : isPassed
                                ? 'bg-[#3FB68B]'
                                : 'bg-white/20'
                            }`}
                          />
                          <span>{step.label}</span>
                        </div>
                        {idx < phaseSteps.length - 1 && (
                          <div
                            className={`flex-1 h-[1px] transition-colors ${
                              isPassed ? 'bg-[#3FB68B]/50' : 'bg-white/10'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* 2. Top KPI Strip (5 cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <Stat
                  label="System Health"
                  value={`${state.kpis.systemHealth}%`}
                  subValue="Target >99.0%"
                  trend={state.kpis.systemHealth > 90 ? 'good' : state.kpis.systemHealth > 75 ? 'warn' : 'crit'}
                  icon={<Activity size={14} />}
                />
                <Stat
                  label="Cascade Risk"
                  value={state.kpis.cascadeRisk}
                  subValue={state.kpis.cascadeRisk === 'LOW' ? 'Nominal' : 'Propagation alert'}
                  trend={state.kpis.cascadeRisk === 'LOW' ? 'good' : state.kpis.cascadeRisk === 'ELEVATED' ? 'warn' : 'crit'}
                  icon={<ShieldAlert size={14} />}
                />
                <Stat
                  label="Active Incidents"
                  value={state.kpis.activeIncidents}
                  subValue={state.kpis.activeIncidents === 0 ? 'Nominal' : 'P1 Investigating'}
                  trend={state.kpis.activeIncidents === 0 ? 'good' : 'crit'}
                  icon={<AlertTriangle size={14} />}
                />
                <Stat
                  label="Services Monitored"
                  value={state.kpis.servicesMonitored}
                  subValue="Synthetic probes"
                  trend="neutral"
                  icon={<Server size={14} />}
                />
                <Stat
                  label="Recovery Readiness"
                  value={`${state.kpis.recoveryReadiness}%`}
                  subValue="Failover verified"
                  trend={state.kpis.recoveryReadiness > 90 ? 'good' : 'warn'}
                  icon={<ShieldCheck size={14} />}
                />
              </div>

              {/* 3. Answer Strip (Ten-second comprehension device) */}
              <AnswerStrip state={state} />

              {/* 4. Graph Card (Cols 1-7) & Upgraded AI Incident Reasoning (Cols 8-12) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7">
                  <ServiceGraph
                    services={state.services}
                    scenarioId={state.scenarioId}
                    severityLevel={state.severityLevel}
                    phase={state.phase}
                    onScenarioChange={(scenId) => dispatch({ type: 'SET_SCENARIO', scenarioId: scenId })}
                    onSeverityChange={(sevLevel) => dispatch({ type: 'SET_SEVERITY', level: sevLevel })}
                    onSimulate={simulateFailure}
                    inspectingServiceId={state.inspectingServiceId}
                    onInspectService={(id) => dispatch({ type: 'INSPECT_SERVICE', serviceId: id })}
                  />
                </div>

                <div className="lg:col-span-5">
                  <AiIncidentReasoning
                    analysis={state.analysis}
                    phase={state.phase}
                    commanderReasoning={state.commanderReasoning}
                    isLoadingAi={state.isLoadingAi}
                  />
                </div>
              </div>

              {/* 5. Blast Radius Containment Panel */}
              <BlastRadiusPanel
                metrics={state.blastRadiusMetrics}
                phase={state.phase}
              />

              {/* 6. Model Verification: Prediction vs Actual */}
              {state.phase === 'resolved' && (
                <PredictionVsActualPanel
                  data={state.predictionVsActual}
                  phase={state.phase}
                />
              )}

              {/* 7. Predicted Failures (Cols 1-5) & Recovery Strategies (Cols 6-12) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                  <PredictedFailures
                    analysis={state.analysis}
                    phase={state.phase}
                  />
                </div>

                <div className="lg:col-span-7">
                  <RecoveryStrategies
                    analysis={state.analysis}
                    phase={state.phase}
                    selectedStrategyId={state.selectedStrategyId}
                    onSelectStrategy={(id) => dispatch({ type: 'SELECT_STRATEGY', strategyId: id })}
                    onExecuteRecovery={() => executeRecovery()}
                  />
                </div>
              </div>

              {/* 8. Live Logs (Cols 1-7) & Incident Timeline (Cols 8-12) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7">
                  <LiveLogs
                    logs={state.logs}
                    isPaused={state.isLogPaused}
                    onTogglePause={() => dispatch({ type: 'SET_LOG_PAUSED', paused: !state.isLogPaused })}
                    onClear={() => dispatch({ type: 'CLEAR_LOGS' })}
                  />
                </div>

                <div className="lg:col-span-5">
                  <IncidentTimeline
                    timeline={state.timeline}
                    phase={state.phase}
                  />
                </div>
              </div>

              {/* 9. Observability Suite */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-tech tracking-wider uppercase font-semibold text-[#8E99A8]">
                    Live System Observability (90s rolling buffer)
                  </span>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className="text-[11px] font-mono-tech text-[#67E8F9] hover:underline"
                  >
                    Expand full analytics →
                  </button>
                </div>
                <AnalyticsCharts
                  metrics={state.metricsHistory}
                  services={state.services}
                  fullSize={false}
                />
              </div>

              {/* 10. Decision Dock (Fixed at bottom center) */}
              <DecisionDock
                analysis={state.analysis}
                phase={state.phase}
                selectedStrategyId={state.selectedStrategyId}
                onExecuteRecovery={() => executeRecovery()}
                onReset={resetSystem}
              />
            </>
          )}

          {currentView === 'what-if' && (
            <WhatIfLabView />
          )}

          {currentView === 'report' && (
            <IncidentReportView report={state.incidentReport} />
          )}

          {currentView === 'infrastructure' && (
            <InfrastructureView
              state={state}
              onScenarioChange={(scenId) => dispatch({ type: 'SET_SCENARIO', scenarioId: scenId })}
              onSeverityChange={(sevLevel) => dispatch({ type: 'SET_SEVERITY', level: sevLevel })}
              onSimulate={simulateFailure}
              onInspectService={(id) => dispatch({ type: 'INSPECT_SERVICE', serviceId: id })}
            />
          )}

          {currentView === 'incidents' && (
            <IncidentsView
              state={state}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'simulator' && (
            <SimulatorView
              state={state}
              onScenarioSelect={(scenId) => dispatch({ type: 'SET_SCENARIO', scenarioId: scenId })}
              onSimulate={simulateFailure}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'recovery' && (
            <RecoveryView
              state={state}
              onSelectStrategy={(id) => dispatch({ type: 'SELECT_STRATEGY', strategyId: id })}
              onExecuteRecovery={() => executeRecovery()}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView state={state} />
          )}
        </main>
      </div>

      {/* Settings Popover Modal */}
      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Global Shortcut Manager & Command Palette (Ctrl+R, Ctrl+E, Ctrl+W, Ctrl+K) */}
      <ShortcutManager
        onRunIncident={simulateFailure}
        onExecuteRecovery={() => executeRecovery()}
        onResetSystem={resetSystem}
        onSelectView={setCurrentView}
        canRunIncident={state.phase === 'healthy'}
        canExecuteRecovery={state.phase === 'incident' || (state.phase !== 'healthy' && state.phase !== 'recovering' && state.phase !== 'resolved')}
        canReset={state.phase !== 'healthy'}
        isOpenPalette={isCommandPaletteOpen}
        onOpenPalette={() => setIsCommandPaletteOpen(true)}
        onClosePalette={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
