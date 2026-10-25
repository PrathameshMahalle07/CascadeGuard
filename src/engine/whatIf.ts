import { ServiceId, WhatIfParams, WhatIfResult, RiskLevel } from '../domain/types';
import { calculatePropagation } from './propagate';
import { calculateRiskScore } from './risk';
import { SCENARIOS } from '../domain/scenarios';
import { SERVICES } from '../domain/services';

export function runWhatIfSimulation(
  origin: ServiceId,
  scenarioId: string,
  params: WhatIfParams
): WhatIfResult {
  // Calculate effective severity amplified by traffic and retries, softened by circuit breaker
  const trafficAmplification = 1 + (params.trafficLoadMultiplier - 1) * 0.25;
  const retryAmplification = 1 + (params.retryMultiplier - 1) * 0.20;
  const circuitBreakerDamper = params.circuitBreakerEnabled ? 0.60 : 1.0;

  const rawEffectiveSeverity =
    params.failureSeverity * trafficAmplification * retryAmplification * circuitBreakerDamper;
  const effectiveSeverity = Math.min(1.0, Math.max(0.20, rawEffectiveSeverity));

  // Run propagation with effective severity
  const propagationMap = calculatePropagation(origin, effectiveSeverity);
  const affectedList = Array.from(propagationMap.keys());
  const allAffected: ServiceId[] = [origin, ...affectedList];

  const probs = Array.from(propagationMap.values()).map((p) => p.probability);
  const { score, level } = calculateRiskScore(probs, effectiveSeverity);

  // Time to critical
  const minEta = Math.min(
    ...Array.from(propagationMap.values()).map((p) => p.etaMin),
    4
  );
  const timeToCritical = Math.round(minEta * (0.9 / effectiveSeverity) * 10) / 10;

  // Recommended mitigation based on severity
  const scen = SCENARIOS[scenarioId] || SCENARIOS['database-latency'];
  const strat =
    scen.strategies.find((s) => s.id === params.selectedStrategyId) ||
    scen.strategies[0];

  const cascadeGraph = allAffected.map((sId) => ({
    serviceId: sId,
    probability: sId === origin ? effectiveSeverity : propagationMap.get(sId)?.probability || 0,
  }));

  return {
    predictedBlastRadiusCount: allAffected.length,
    affectedServices: allAffected,
    timeToCriticalMin: Math.max(0.5, timeToCritical),
    riskLevel: level,
    riskScore: score,
    recommendedMitigation: strat ? strat.name : 'Automated Failover',
    expectedRecoverySec: strat ? strat.recoverySec : 42,
    cascadeGraph,
  };
}
