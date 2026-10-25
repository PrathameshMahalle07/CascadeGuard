import { AnalysisResult, ServiceId } from '../domain/types';
import { SCENARIOS } from '../domain/scenarios';
import { calculatePropagation } from './propagate';
import { rankStrategies } from './strategies';
import { calculateRiskScore } from './risk';
import { determineRootCause } from './rootCause';

export function runDeterministicAnalysis(
  scenarioId: string,
  severityOverride?: number
): AnalysisResult {
  const scenario = SCENARIOS[scenarioId] || SCENARIOS['database-latency'];
  const severity = severityOverride !== undefined ? severityOverride : scenario.defaultSeverity;

  // 1. Calculate propagation along dependency graph
  const propagationMap = calculatePropagation(scenario.origin, severity);

  // 2. Build predicted failures list sorted by probability descending
  const predictedFailures = Array.from(propagationMap.values())
    .map((p) => ({
      serviceId: p.serviceId,
      probability: Math.round(p.probability * 100) / 100,
      etaMin: p.etaMin,
    }))
    .sort((a, b) => b.probability - a.probability);

  // 3. Build cascade path from origin through hops
  const cascadePath: { serviceId: ServiceId; state: 'critical' | 'degraded' | 'at-risk'; hop: number }[] = [
    { serviceId: scenario.origin, state: 'critical', hop: 0 },
  ];

  const sortedHops = Array.from(propagationMap.values()).sort((a, b) => a.hop - b.hop);
  for (const hopItem of sortedHops) {
    cascadePath.push({
      serviceId: hopItem.serviceId,
      state: hopItem.hop === 1 ? 'degraded' : 'at-risk',
      hop: hopItem.hop,
    });
  }

  // 4. Calculate Risk Score (P are the downstream predicted failure probabilities, s is origin severity)
  const predictedProbs = predictedFailures.map((p) => p.probability);
  const risk = calculateRiskScore(predictedProbs, severity);

  // 5. Score & Rank Strategies
  const { scored, recommendedId } = rankStrategies(scenario.strategies);
  const bestStrategy = scored.find((s) => s.id === recommendedId) || scored[0];

  // 6. Root cause analysis
  const rootCause = determineRootCause(scenario.origin, severity, scenario.id);

  // 7. Reasoning
  const whyThisMatters = [
    `${scenario.origin.toUpperCase()} degradation propagates downstream to ${predictedFailures.map((p) => p.serviceId).join(', ')}.`,
    `Failure to remediate will exhaust ingress gateway buffers within estimated ETAs.`,
    `Synchronous dependency coupling amplifies request retry storm.`,
  ];

  const whyRecommended = `Lowest predicted downstream impact with the fastest estimated recovery (${bestStrategy.recoverySec}s).`;

  const tradeoffs = [
    `Executes in ${bestStrategy.recoverySec}s with minimal localized connection reconnect overhead.`,
    `Bypasses slower manual cold-start recovery cycles that introduce secondary stampedes.`,
  ];

  return {
    scenarioId: scenario.id,
    title: scenario.name,
    rootCause,
    cascadePath,
    predictedFailures,
    risk,
    impact: scenario.impactSummary,
    strategies: scored,
    recommendedStrategyId: recommendedId,
    reasoning: {
      whyThisMatters,
      whyRecommended,
      tradeoffs,
      plainSummary: `${scenario.name} detected. Cascade vector targeting ${predictedFailures[0]?.serviceId || 'dependents'}. Recommended: ${bestStrategy.name}.`,
    },
    source: 'deterministic',
  };
}
