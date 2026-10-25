import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import {
  ServiceId,
  ServiceStatus,
  ServiceRuntimeState,
  SimPhase,
  LogEntry,
  TimelineEntry,
  MetricPoint,
  SimSettings,
  AnalysisResult,
  SeverityLevel,
  GeminiIncidentCommanderOutput,
  BlastRadiusMetrics,
  PredictionVsActual,
  IncidentReport,
} from '../domain/types';
import { SERVICES, SERVICE_LIST, DEPENDENCY_EDGES } from '../domain/services';
import { SCENARIOS } from '../domain/scenarios';
import { runDeterministicAnalysis } from '../engine/analyze';
import { calculateBlastRadiusMetrics } from '../engine/blastRadius';
import { getDeterministicCommanderReasoning } from '../server/geminiHandler';
import { HERO_SCRIPTED_LOGS, generateSeededFillerLog, createLogEntry } from '../engine/logs';

export interface SimState {
  phase: SimPhase;
  scenarioId: string;
  severityLevel: SeverityLevel;
  severityValue: number;
  services: Record<ServiceId, ServiceRuntimeState>;
  analysis: AnalysisResult | null;
  selectedStrategyId: string | null;
  commanderReasoning: GeminiIncidentCommanderOutput | null;
  blastRadiusMetrics: BlastRadiusMetrics | null;
  predictionVsActual: PredictionVsActual | null;
  incidentReport: IncidentReport | null;
  isLoadingAi: boolean;
  logs: LogEntry[];
  timeline: TimelineEntry[];
  metricsHistory: MetricPoint[];
  kpis: {
    systemHealth: number; // 98.4% nominal
    cascadeRisk: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    activeIncidents: number; // 0 or 1
    servicesMonitored: number; // 8
    recoveryReadiness: number; // 94% nominal
  };
  simClock: string; // e.g. "12:41:00"
  recoveryStep: number; // 0 to 6
  recoveryStepText: string;
  isLogPaused: boolean;
  inspectingServiceId: ServiceId | null;
  analyzingStep: number; // 0 to 4
  resolvedSummary: string | null;
  announcement: string;
}

const INITIAL_SERVICES: Record<ServiceId, ServiceRuntimeState> = Object.fromEntries(
  SERVICE_LIST.map((s) => [
    s.id,
    {
      id: s.id,
      name: s.name,
      status: 'healthy' as ServiceStatus,
      currentP95: s.baselineP95,
      currentErrorRate: s.baselineErrorRate,
      saturation: Math.round(18 + Math.random() * 8),
      atRiskProbability: 0,
      etaMin: 0,
    },
  ])
) as Record<ServiceId, ServiceRuntimeState>;

const INITIAL_METRICS: MetricPoint[] = Array.from({ length: 30 }, (_, i) => {
  const m = 30 - i;
  return {
    time: `12:${Math.max(0, 40 - Math.floor(m / 60))}:${(60 - (m % 60)).toString().padStart(2, '0')}`,
    databaseP95: 34 + Math.round((Math.sin(i * 0.4) * 2)),
    paymentP95: 96 + Math.round((Math.cos(i * 0.3) * 3)),
    gatewayP95: 124 + Math.round((Math.sin(i * 0.5) * 4)),
    gatewayErrorRate: 0.2,
    paymentRiskProb: 0,
    gatewayRiskProb: 0,
    frontendRiskProb: 0,
  };
});

const INITIAL_LOGS: LogEntry[] = [
  createLogEntry('12:40:15', 'INFO', 'gateway', 'Ingress route mesh healthy pool=12', 'req_init01'),
  createLogEntry('12:40:28', 'INFO', 'auth', 'JWKS public certificate cache refreshed', 'req_init02'),
  createLogEntry('12:40:42', 'INFO', 'cache', 'Redis cluster ping 0.4ms slot_sync=ok', 'req_init03'),
  createLogEntry('12:40:55', 'INFO', 'database', 'pg_stat_statements buffer hit ratio 99.4%', 'req_init04'),
  createLogEntry('12:41:00', 'INFO', 'engine', 'CascadeGuard telemetry daemon active', 'sys_mon_01'),
];

export const INITIAL_STATE: SimState = {
  phase: 'healthy',
  scenarioId: 'database-latency',
  severityLevel: 'high',
  severityValue: 0.90,
  services: INITIAL_SERVICES,
  analysis: null,
  selectedStrategyId: null,
  commanderReasoning: null,
  blastRadiusMetrics: null,
  predictionVsActual: null,
  incidentReport: null,
  isLoadingAi: false,
  logs: INITIAL_LOGS,
  timeline: [],
  metricsHistory: INITIAL_METRICS,
  kpis: {
    systemHealth: 98.4,
    cascadeRisk: 'LOW',
    activeIncidents: 0,
    servicesMonitored: 8,
    recoveryReadiness: 94,
  },
  simClock: '12:41:00',
  recoveryStep: 0,
  recoveryStepText: '',
  isLogPaused: false,
  inspectingServiceId: null,
  analyzingStep: 0,
  resolvedSummary: null,
  announcement: 'Monitoring active. All 8 services nominal.',
};

type Action =
  | { type: 'SET_SCENARIO'; scenarioId: string }
  | { type: 'SET_SEVERITY'; level: SeverityLevel }
  | { type: 'START_INJECTION'; analysis: AnalysisResult; blastRadius: BlastRadiusMetrics; commanderReasoning: GeminiIncidentCommanderOutput }
  | { type: 'STEP_ORIGIN_DEGRADE'; originId: ServiceId; latency: number }
  | { type: 'STEP_ORIGIN_CRITICAL'; originId: ServiceId; latency: number }
  | { type: 'STEP_ANALYZING'; step: number }
  | { type: 'STEP_PROPAGATE_HOP'; serviceId: ServiceId; status: ServiceStatus; latency: number; prob: number; eta: number }
  | { type: 'INCIDENT_READY'; analysis: AnalysisResult }
  | { type: 'SELECT_STRATEGY'; strategyId: string }
  | { type: 'START_RECOVERY'; stepText: string }
  | { type: 'STEP_RECOVERY'; stepNum: number; stepText: string; servicesRecovered?: ServiceId[] }
  | { type: 'SYSTEM_RESOLVED'; summary: string; predictionVsActual: PredictionVsActual; report: IncidentReport }
  | { type: 'RESET_SYSTEM' }
  | { type: 'APPEND_LOG'; log: LogEntry }
  | { type: 'APPEND_METRIC'; metric: MetricPoint }
  | { type: 'SET_LOG_PAUSED'; paused: boolean }
  | { type: 'CLEAR_LOGS' }
  | { type: 'INSPECT_SERVICE'; serviceId: ServiceId | null }
  | { type: 'SET_COMMANDER_REASONING'; reasoning: GeminiIncidentCommanderOutput; loading: boolean };

function simReducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case 'SET_SCENARIO': {
      if (state.phase !== 'healthy') return state;
      const scen = SCENARIOS[action.scenarioId] || SCENARIOS['database-latency'];
      return {
        ...state,
        scenarioId: scen.id,
        severityValue: scen.defaultSeverity,
        severityLevel: 'high',
      };
    }

    case 'SET_SEVERITY': {
      if (state.phase !== 'healthy') return state;
      const val = action.level === 'medium' ? 0.60 : action.level === 'critical' ? 0.95 : (SCENARIOS[state.scenarioId]?.defaultSeverity || 0.90);
      return {
        ...state,
        severityLevel: action.level,
        severityValue: val,
      };
    }

    case 'START_INJECTION': {
      return {
        ...state,
        phase: 'injecting',
        analysis: action.analysis,
        blastRadiusMetrics: action.blastRadius,
        commanderReasoning: action.commanderReasoning,
        selectedStrategyId: action.analysis.recommendedStrategyId,
        kpis: {
          ...state.kpis,
          activeIncidents: 1,
          recoveryReadiness: 88,
        },
        simClock: '12:41:00',
        announcement: `Incident initiated: ${action.analysis.title}. Anomaly detected across distributed telemetry.`,
        timeline: [
          {
            id: 'tl_start',
            time: '12:41',
            message: `${action.analysis.rootCause.label} detected at origin`,
            phase: 'injecting',
            highlight: true,
          },
        ],
      };
    }

    case 'STEP_ORIGIN_DEGRADE': {
      const orig = state.services[action.originId];
      return {
        ...state,
        services: {
          ...state.services,
          [action.originId]: {
            ...orig,
            status: 'degraded',
            currentP95: action.latency,
            saturation: 76,
          },
        },
        kpis: {
          ...state.kpis,
          systemHealth: 89.2,
          cascadeRisk: 'ELEVATED',
        },
      };
    }

    case 'STEP_ORIGIN_CRITICAL': {
      const orig = state.services[action.originId];
      return {
        ...state,
        services: {
          ...state.services,
          [action.originId]: {
            ...orig,
            status: 'critical',
            currentP95: action.latency,
            saturation: 96,
          },
        },
        kpis: {
          ...state.kpis,
          systemHealth: 74.5,
          cascadeRisk: 'HIGH',
        },
        timeline: [
          ...state.timeline,
          {
            id: 'tl_crit',
            time: '12:41',
            message: `${orig.name} saturation exceeded threshold: query latency spiked to ${action.latency}ms`,
            phase: 'injecting',
          },
        ],
      };
    }

    case 'STEP_ANALYZING': {
      return {
        ...state,
        phase: 'analyzing',
        analyzingStep: action.step,
      };
    }

    case 'STEP_PROPAGATE_HOP': {
      const target = state.services[action.serviceId];
      return {
        ...state,
        services: {
          ...state.services,
          [action.serviceId]: {
            ...target,
            status: action.status,
            currentP95: action.latency,
            atRiskProbability: action.prob,
            etaMin: action.eta,
          },
        },
        timeline: [
          ...state.timeline,
          {
            id: `tl_${action.serviceId}`,
            time: '12:42',
            message: `${target.name} degraded (${Math.round(action.prob * 100)}% cascade risk, ~${action.eta}m ETA)`,
            phase: 'analyzing',
          },
        ],
      };
    }

    case 'INCIDENT_READY': {
      return {
        ...state,
        phase: 'incident',
        analysis: action.analysis,
        selectedStrategyId: action.analysis.recommendedStrategyId,
        kpis: {
          ...state.kpis,
          systemHealth: 71.2,
          cascadeRisk: action.analysis.risk.level,
        },
        simClock: '12:43:00',
        announcement: `Incident predicted: ${action.analysis.title}. Recommended recovery: ${action.analysis.strategies[0]?.name}.`,
        timeline: [
          ...state.timeline,
          {
            id: 'tl_predict',
            time: '12:43',
            message: `Cascade vector predicted across ${action.analysis.predictedFailures.length} dependent tiers`,
            phase: 'incident',
            highlight: true,
          },
          {
            id: 'tl_strat',
            time: '12:43',
            message: `AI recommends ${action.analysis.strategies[0]?.name} (${action.analysis.strategies[0]?.recoverySec}s target)`,
            phase: 'incident',
          },
        ],
      };
    }

    case 'SELECT_STRATEGY': {
      return {
        ...state,
        selectedStrategyId: action.strategyId,
      };
    }

    case 'START_RECOVERY': {
      return {
        ...state,
        phase: 'recovering',
        recoveryStep: 1,
        recoveryStepText: action.stepText,
        announcement: `Recovery initiated: ${action.stepText}`,
        timeline: [
          ...state.timeline,
          {
            id: 'tl_rec_start',
            time: '12:44',
            message: `Recovery execution started: ${action.stepText}`,
            phase: 'recovering',
            highlight: true,
          },
        ],
      };
    }

    case 'STEP_RECOVERY': {
      let updatedServices = { ...state.services };
      if (action.servicesRecovered) {
        for (const sId of action.servicesRecovered) {
          const base = SERVICES[sId];
          updatedServices[sId] = {
            ...updatedServices[sId],
            status: 'recovering',
            currentP95: Math.round(base.baselineP95 * 1.2),
            atRiskProbability: 0,
          };
        }
      }

      const clockSnap = action.stepNum >= 3 ? '12:44:30' : '12:44:00';

      return {
        ...state,
        recoveryStep: action.stepNum,
        recoveryStepText: action.stepText,
        services: updatedServices,
        simClock: clockSnap,
        timeline: [
          ...state.timeline,
          {
            id: `tl_step_${action.stepNum}`,
            time: '12:44',
            message: action.stepText,
            phase: 'recovering',
          },
        ],
      };
    }

    case 'SYSTEM_RESOLVED': {
      // Restore all services to nominal baseline
      const restoredServices: Record<ServiceId, ServiceRuntimeState> = {} as any;
      for (const [k, v] of Object.entries(SERVICES)) {
        restoredServices[k as ServiceId] = {
          id: k as ServiceId,
          name: v.name,
          status: 'healthy',
          currentP95: v.baselineP95,
          currentErrorRate: v.baselineErrorRate,
          saturation: Math.round(18 + Math.random() * 8),
          atRiskProbability: 0,
          etaMin: 0,
        };
      }

      return {
        ...state,
        phase: 'resolved',
        services: restoredServices,
        kpis: {
          systemHealth: 98.4,
          cascadeRisk: 'LOW',
          activeIncidents: 0,
          servicesMonitored: 8,
          recoveryReadiness: 94,
        },
        simClock: '12:45:00',
        resolvedSummary: action.summary,
        predictionVsActual: action.predictionVsActual,
        incidentReport: action.report,
        announcement: `System recovered. ${action.summary}`,
        timeline: [
          ...state.timeline,
          {
            id: 'tl_resolved',
            time: '12:45',
            message: 'System stabilized: all 8 services returned to nominal latency',
            phase: 'resolved',
            highlight: true,
          },
        ],
      };
    }

    case 'RESET_SYSTEM': {
      return {
        ...INITIAL_STATE,
        scenarioId: state.scenarioId,
        severityLevel: state.severityLevel,
        severityValue: state.severityValue,
      };
    }

    case 'APPEND_LOG': {
      if (state.isLogPaused) return state;
      const updated = [action.log, ...state.logs];
      return {
        ...state,
        logs: updated.slice(0, 200), // Cap at 200 lines
      };
    }

    case 'APPEND_METRIC': {
      const history = [...state.metricsHistory, action.metric];
      return {
        ...state,
        metricsHistory: history.slice(-90), // Keep 90 points
      };
    }

    case 'SET_LOG_PAUSED': {
      return {
        ...state,
        isLogPaused: action.paused,
      };
    }

    case 'CLEAR_LOGS': {
      return {
        ...state,
        logs: [],
      };
    }

    case 'INSPECT_SERVICE': {
      return {
        ...state,
        inspectingServiceId: action.serviceId,
      };
    }

    case 'SET_COMMANDER_REASONING': {
      return {
        ...state,
        commanderReasoning: action.reasoning,
        isLoadingAi: action.loading,
      };
    }

    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(simReducer, INITIAL_STATE);
  const [settings, setSettings] = useState<SimSettings>({
    simSpeed: 1,
    reduceMotion: false,
    aiLanguageAnalysis: true,
  });

  const timerRefs = useRef<NodeJS.Timeout[]>([]);
  const tickerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timers cleanly
  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const adjustedMs = ms / settings.simSpeed;
    const tid = setTimeout(fn, adjustedMs);
    timerRefs.current.push(tid);
    return tid;
  }, [settings.simSpeed]);

  // Periodic metrics & background filler log ticker (every 1s)
  useEffect(() => {
    let tickCount = 0;
    tickerIntervalRef.current = setInterval(() => {
      tickCount++;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // Generate seeded filler log every 3 seconds if not in active rapid recovery
      if (tickCount % 3 === 0) {
        const filler = generateSeededFillerLog(timeStr, tickCount);
        dispatch({ type: 'APPEND_LOG', log: filler });
      }

      // Append metric point
      const dbLatency = state.services.database.currentP95 + (Math.sin(tickCount * 0.4) * 2);
      const payLatency = state.services.payment.currentP95 + (Math.cos(tickCount * 0.3) * 3);
      const gwLatency = state.services.gateway.currentP95 + (Math.sin(tickCount * 0.5) * 4);
      const gwErr = state.services.gateway.currentErrorRate;

      dispatch({
        type: 'APPEND_METRIC',
        metric: {
          time: timeStr,
          databaseP95: Math.round(dbLatency),
          paymentP95: Math.round(payLatency),
          gatewayP95: Math.round(gwLatency),
          gatewayErrorRate: Math.round(gwErr * 10) / 10,
          paymentRiskProb: state.services.payment.atRiskProbability || 0,
          gatewayRiskProb: state.services.gateway.atRiskProbability || 0,
          frontendRiskProb: state.services.frontend.atRiskProbability || 0,
        },
      });
    }, 1000 / settings.simSpeed);

    return () => {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  }, [state.services, settings.simSpeed]);

  // 1. SIMULATE FAILURE / RUN INCIDENT ACTION
  const simulateFailure = useCallback(() => {
    if (state.phase !== 'healthy') return;
    clearAllTimers();

    const analysis = runDeterministicAnalysis(state.scenarioId, state.severityValue);
    const scenario = SCENARIOS[state.scenarioId] || SCENARIOS['database-latency'];
    const origin = scenario.origin;
    const bestStrategy = analysis.strategies[0];

    // Compute Blast Radius metrics
    const blastRadius = calculateBlastRadiusMetrics(origin, state.severityValue, bestStrategy.recoverySec);

    // Initial instant fallback reasoning
    const initialReasoning = getDeterministicCommanderReasoning({
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      originService: SERVICES[origin].name,
      severity: state.severityValue,
      predictedFailures: analysis.predictedFailures,
      rootCause: analysis.rootCause,
      recommendedStrategy: bestStrategy,
    });

    // t=0.0s: Start injection
    dispatch({
      type: 'START_INJECTION',
      analysis,
      blastRadius,
      commanderReasoning: initialReasoning,
    });

    // Background fetch to server-side Gemini Incident Commander
    if (settings.aiLanguageAnalysis) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 3500);

      fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          originService: SERVICES[origin].name,
          severity: state.severityValue,
          predictedFailures: analysis.predictedFailures,
          rootCause: analysis.rootCause,
          recommendedStrategy: bestStrategy,
          logs: state.logs.slice(0, 10),
        }),
        signal: abortController.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject('API failed')))
        .then((data) => {
          clearTimeout(timeoutId);
          if (data.success && data.data) {
            dispatch({ type: 'SET_COMMANDER_REASONING', reasoning: data.data, loading: false });
          }
        })
        .catch(() => {
          // Graceful silent fallback to deterministic synthesis
          clearTimeout(timeoutId);
        });
    }

    // Scripted Hero / Scenario Logs at t=0 to 1.5s
    addTimer(() => {
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:41:02', 'INFO', 'gateway', 'upstream latency 124ms', 'req_8f102a'),
      });
    }, 200);

    // t=0.4s: Origin node turns DEGRADED
    addTimer(() => {
      dispatch({
        type: 'STEP_ORIGIN_DEGRADE',
        originId: origin,
        latency: origin === 'database' ? 281 : 450,
      });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:41:04', 'WARN', origin, `query latency 281ms`, 'req_3e911c'),
      });
    }, 400);

    // t=1.5s: Origin node CRITICAL
    addTimer(() => {
      dispatch({
        type: 'STEP_ORIGIN_CRITICAL',
        originId: origin,
        latency: origin === 'database' ? 643 : 890,
      });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:41:07', 'WARN', origin, `query latency 643ms pool 91%`, 'req_9a044b'),
      });
    }, 1500);

    // t=2.0s: AI analyzing phase with 4 labeled steps
    addTimer(() => {
      dispatch({ type: 'STEP_ANALYZING', step: 1 }); // Correlating logs
    }, 2000);
    addTimer(() => {
      dispatch({ type: 'STEP_ANALYZING', step: 2 }); // Tracing dependencies
    }, 2350);
    addTimer(() => {
      dispatch({ type: 'STEP_ANALYZING', step: 3 }); // Scoring cascade risk
    }, 2700);
    addTimer(() => {
      dispatch({ type: 'STEP_ANALYZING', step: 4 }); // Ranking strategies
    }, 3050);

    // t=2.5s: First hop degrades (e.g. Payment)
    addTimer(() => {
      const hop1 = analysis.cascadePath.find((p) => p.hop === 1);
      if (hop1) {
        dispatch({
          type: 'STEP_PROPAGATE_HOP',
          serviceId: hop1.serviceId,
          status: 'degraded',
          latency: 240,
          prob: analysis.predictedFailures.find((f) => f.serviceId === hop1.serviceId)?.probability || 0.82,
          eta: 4,
        });
        dispatch({
          type: 'APPEND_LOG',
          log: createLogEntry('12:41:09', 'WARN', hop1.serviceId, 'retry rate +18%', 'req_22c710'),
        });
      }
    }, 2500);

    // t=3.5s: Second hop at risk (e.g. API Gateway)
    addTimer(() => {
      const hop2 = analysis.cascadePath.find((p) => p.hop === 2);
      if (hop2) {
        dispatch({
          type: 'STEP_PROPAGATE_HOP',
          serviceId: hop2.serviceId,
          status: 'at-risk',
          latency: 380,
          prob: analysis.predictedFailures.find((f) => f.serviceId === hop2.serviceId)?.probability || 0.67,
          eta: 6,
        });
        dispatch({
          type: 'APPEND_LOG',
          log: createLogEntry('12:41:11', 'ERROR', hop2.serviceId, 'error rate +7%', 'req_5d199a'),
        });
      }
    }, 3500);

    // t=4.0s: Phase incident: AI incident analysis revealed & timeline appended
    addTimer(() => {
      dispatch({ type: 'INCIDENT_READY', analysis });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:41:13', 'WARN', 'engine', 'dependency risk elevated', 'sys_cascade_01'),
      });
    }, 4000);

    // t=4.5s: Third hop at risk (e.g. Frontend)
    addTimer(() => {
      const hop3 = analysis.cascadePath.find((p) => p.hop === 3);
      if (hop3) {
        dispatch({
          type: 'STEP_PROPAGATE_HOP',
          serviceId: hop3.serviceId,
          status: 'at-risk',
          latency: 520,
          prob: analysis.predictedFailures.find((f) => f.serviceId === hop3.serviceId)?.probability || 0.41,
          eta: 8,
        });
      }
    }, 4500);
  }, [state.phase, state.scenarioId, state.severityValue, state.logs, settings.aiLanguageAnalysis, clearAllTimers, addTimer]);

  // 2. EXECUTE RECOVERY ACTION
  const executeRecovery = useCallback((strategyIdToExecute?: string) => {
    if (state.phase !== 'incident' && state.phase !== 'analyzing') return;
    clearAllTimers();

    const chosenId = strategyIdToExecute || state.selectedStrategyId || state.analysis?.recommendedStrategyId;
    const strategy = state.analysis?.strategies.find((s) => s.id === chosenId) || state.analysis?.strategies[0];
    if (!strategy) return;

    const isRecommended = strategy.id === state.analysis?.recommendedStrategyId;
    const stepDuration = 900; // ms per step
    const steps = strategy.steps && strategy.steps.length >= 6 ? strategy.steps : [
      'Initiating automated recovery protocol',
      'Remediation target identified in cluster',
      'Traffic safely redirected',
      'Dependency health recalculated',
      'Services stabilizing',
      'System nominal state verified',
    ];

    // Step 01: Initiating
    dispatch({ type: 'START_RECOVERY', stepText: `01 ${steps[0]}` });
    dispatch({
      type: 'APPEND_LOG',
      log: createLogEntry('12:44:00', 'INFO', 'engine', `Recovery started: ${strategy.name}`, 'sys_rec_01'),
    });

    // Step 02: Target identified
    addTimer(() => {
      dispatch({ type: 'STEP_RECOVERY', stepNum: 2, stepText: `02 ${steps[1]}` });
    }, stepDuration * 1);

    // Step 03: Traffic redirected
    addTimer(() => {
      dispatch({ type: 'STEP_RECOVERY', stepNum: 3, stepText: `03 ${steps[2]}` });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:44:18', 'INFO', 'gateway', 'Ingress traffic redirected to target pool', 'sys_rec_02'),
      });
    }, stepDuration * 2);

    // Step 04: Dependency health recalculated (nodes recover bottom-up)
    addTimer(() => {
      const recovered: ServiceId[] = ['database', 'payment', 'cache', 'auth'];
      dispatch({
        type: 'STEP_RECOVERY',
        stepNum: 4,
        stepText: `04 ${steps[3]}`,
        servicesRecovered: recovered,
      });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:44:32', 'INFO', 'payment', 'Query response p95 dropping to 96ms', 'sys_rec_03'),
      });
    }, stepDuration * 3);

    // Step 05: Services stabilizing (latencies decay)
    addTimer(() => {
      const recovered: ServiceId[] = ['gateway', 'frontend', 'notification', 'storage'];
      dispatch({
        type: 'STEP_RECOVERY',
        stepNum: 5,
        stepText: `05 ${steps[4]}`,
        servicesRecovered: recovered,
      });
    }, stepDuration * 4);

    // Step 06: System recovered
    addTimer(() => {
      dispatch({ type: 'STEP_RECOVERY', stepNum: 6, stepText: `06 ${steps[5]}` });
    }, stepDuration * 5);

    // +5.4s (+stepDuration * 6): Resolved state
    addTimer(() => {
      const summary = isRecommended
        ? `Payment failure averted. Predicted ~4 min ahead, recovered in ${strategy.recoverySec}s (simulated).`
        : `Recovery executed via ${strategy.name}. Recovered in ${strategy.recoverySec}s with ${strategy.impact} impact.`;

      const affectedCount = (state.analysis?.predictedFailures.length || 3) + 1;
      const predictionVsActual: PredictionVsActual = {
        predictedAffectedCount: affectedCount,
        actualAffectedCount: affectedCount,
        predictedServices: state.analysis?.cascadePath.map((p) => SERVICES[p.serviceId]?.name || p.serviceId) || [],
        actualServices: state.analysis?.cascadePath.map((p) => SERVICES[p.serviceId]?.name || p.serviceId) || [],
        predictedTimeToFailureMin: state.analysis?.predictedFailures[0]?.etaMin || 4,
        actualRecoveryTimeSec: strategy.recoverySec,
        accuracyScore: 96,
      };

      const blastRadius =
        state.blastRadiusMetrics ||
        calculateBlastRadiusMetrics(
          state.analysis?.rootCause.serviceId || 'database',
          state.severityValue,
          strategy.recoverySec
        );

      const report: IncidentReport = {
        incidentId: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        scenarioName: state.analysis?.title || 'System Latency Anomaly',
        severity: state.severityLevel.toUpperCase(),
        rootCause: state.analysis?.rootCause.label || 'Origin Node Contention',
        confidence: state.analysis?.rootCause.confidence || 94,
        evidence: state.analysis?.rootCause.evidence || [],
        cascadePath: state.analysis?.cascadePath.map((p) => SERVICES[p.serviceId]?.name || p.serviceId) || [],
        blastRadiusMetrics: blastRadius,
        recoveryStrategyTaken: strategy.name,
        recoveryDurationSec: strategy.recoverySec,
        commanderNotes: state.commanderReasoning?.whyThisAction || 'Automated cluster failover completed with zero transactional data loss.',
        finalHealthScore: 98.4,
      };

      dispatch({ type: 'SYSTEM_RESOLVED', summary, predictionVsActual, report });
      dispatch({
        type: 'APPEND_LOG',
        log: createLogEntry('12:45:00', 'INFO', 'engine', `System fully stabilized: 98.4% health, LOW risk`, 'sys_rec_done'),
      });
    }, stepDuration * 6);
  }, [state.phase, state.selectedStrategyId, state.analysis, state.blastRadiusMetrics, state.severityValue, state.severityLevel, state.commanderReasoning, clearAllTimers, addTimer]);

  // 3. RESET ACTION
  const resetSystem = useCallback(() => {
    clearAllTimers();
    dispatch({ type: 'RESET_SYSTEM' });
  }, [clearAllTimers]);

  // Keyboard Shortcuts (Presenter mode: S, E, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        if (state.phase === 'healthy') {
          e.preventDefault();
          simulateFailure();
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (state.phase === 'incident' || state.phase === 'analyzing') {
          e.preventDefault();
          executeRecovery();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (state.phase !== 'healthy') {
          e.preventDefault();
          resetSystem();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, simulateFailure, executeRecovery, resetSystem]);

  return {
    state,
    settings,
    setSettings,
    dispatch,
    simulateFailure,
    executeRecovery,
    resetSystem,
  };
}
