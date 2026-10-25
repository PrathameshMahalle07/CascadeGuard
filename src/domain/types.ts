export type ServiceId =
  | 'frontend'
  | 'gateway'
  | 'auth'
  | 'payment'
  | 'notification'
  | 'cache'
  | 'database'
  | 'storage';

export type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'at-risk' | 'recovering';

export type RiskLevel = 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type SeverityLevel = 'medium' | 'high' | 'critical';

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  baselineP95: number; // in ms
  baselineErrorRate: number; // in %
  x: number;
  y: number;
  dependencies: ServiceId[]; // services this service calls (requests flow down)
  dependents: ServiceId[];   // services that call this service (failure propagates up)
}

export interface DependencyEdge {
  from: ServiceId; // dependent
  to: ServiceId;   // dependency
  weight: number;  // failure propagation transmission coefficient
}

export interface ServiceRuntimeState {
  id: ServiceId;
  name: string;
  status: ServiceStatus;
  currentP95: number;
  currentErrorRate: number;
  saturation: number;
  atRiskProbability?: number;
  etaMin?: number;
}

export type ImpactLevel = 'low' | 'medium' | 'high';

export interface RecoveryStrategy {
  id: string;
  name: string;
  risk: ImpactLevel;
  impact: ImpactLevel;
  recoverySec: number;
  score: number;
  rationale: string;
  tradeoffNote?: string;
  steps: string[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  origin: ServiceId;
  defaultSeverity: number;
  description: string;
  impactSummary: string;
  strategies: Omit<RecoveryStrategy, 'score'>[];
}

export interface PredictedFailure {
  serviceId: ServiceId;
  probability: number; // 0 to 1
  etaMin: number;
}

export interface AnalysisResult {
  scenarioId: string;
  title: string;
  rootCause: {
    serviceId: ServiceId;
    label: string;
    confidence: number;
    evidence: string[];
  };
  cascadePath: {
    serviceId: ServiceId;
    state: 'critical' | 'degraded' | 'at-risk';
    hop: number;
  }[];
  predictedFailures: PredictedFailure[];
  risk: {
    level: RiskLevel;
    score: number;
  };
  impact: string;
  strategies: RecoveryStrategy[];
  recommendedStrategyId: string;
  reasoning: {
    whyThisMatters: string[];
    whyRecommended: string;
    tradeoffs: string[];
    plainSummary?: string;
  };
  source: 'deterministic' | 'deterministic+language';
}

export type SimPhase =
  | 'healthy'
  | 'injecting'
  | 'analyzing'
  | 'incident'
  | 'recovering'
  | 'resolved';

export interface LogEntry {
  id: string;
  timestamp: string; // HH:MM:SS
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
  requestId: string;
}

export interface TimelineEntry {
  id: string;
  time: string; // e.g. "12:41"
  message: string;
  phase: SimPhase;
  highlight?: boolean;
}

export interface MetricPoint {
  time: string;
  databaseP95: number;
  paymentP95: number;
  gatewayP95: number;
  gatewayErrorRate: number;
  paymentRiskProb: number;
  gatewayRiskProb: number;
  frontendRiskProb: number;
}

export interface GeminiIncidentCommanderOutput {
  rootCauseSummary: string;
  detailedEvidence: string[];
  cascadeMechanism: string;
  blastRadiusExplanation: string;
  recommendedAction: string;
  whyThisAction: string;
  riskIfIgnored: string;
  confidence: number;
  uncertainties: string[];
  provenance: 'ENGINE VERIFIED + GEMINI REASONING' | 'ENGINE VERIFIED (DETERMINISTIC FALLBACK)';
}

export interface BlastRadiusMetrics {
  withoutInterventionCount: number;
  withInterventionCount: number;
  blastRadiusAvoidedPct: number;
  servicesProtected: string; // e.g. "4/5"
  timeSavedText: string;     // e.g. "6m 18s → 42s"
  userImpactReductionPct: number;
  unmitigatedPath: string[];
  mitigatedPath: string[];
}

export interface WhatIfParams {
  failureSeverity: number;
  trafficLoadMultiplier: number;
  retryMultiplier: number;
  circuitBreakerEnabled: boolean;
  selectedStrategyId: string;
}

export interface WhatIfResult {
  predictedBlastRadiusCount: number;
  affectedServices: ServiceId[];
  timeToCriticalMin: number;
  riskLevel: RiskLevel;
  riskScore: number;
  recommendedMitigation: string;
  expectedRecoverySec: number;
  cascadeGraph: { serviceId: ServiceId; probability: number }[];
}

export interface PredictionVsActual {
  predictedAffectedCount: number;
  actualAffectedCount: number;
  predictedServices: string[];
  actualServices: string[];
  predictedTimeToFailureMin: number;
  actualRecoveryTimeSec: number;
  accuracyScore: number;
}

export interface IncidentReport {
  incidentId: string;
  timestamp: string;
  scenarioName: string;
  severity: string;
  rootCause: string;
  confidence: number;
  evidence: string[];
  cascadePath: string[];
  blastRadiusMetrics: BlastRadiusMetrics;
  recoveryStrategyTaken: string;
  recoveryDurationSec: number;
  commanderNotes: string;
  finalHealthScore: number;
}

export interface SimSettings {
  simSpeed: 1 | 2;
  reduceMotion: boolean;
  aiLanguageAnalysis: boolean;
}

