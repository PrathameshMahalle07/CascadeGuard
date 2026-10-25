import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBlastRadiusMetrics } from './blastRadius';
import { runWhatIfSimulation } from './whatIf';

test('Blast Radius Calculation Test: database at 0.90 with 42s recovery', () => {
  const metrics = calculateBlastRadiusMetrics('database', 0.90, 42);

  // Unmitigated cascade affects Database + Payment + Gateway + Frontend = 4
  assert.equal(metrics.withoutInterventionCount, 4);
  assert.equal(metrics.withInterventionCount, 1);
  assert.equal(metrics.blastRadiusAvoidedPct, 75);
  assert.equal(metrics.servicesProtected, '3/4');
  assert.ok(metrics.timeSavedText.includes('42s'));
  assert.ok(metrics.userImpactReductionPct >= 80);
});

test('What-If Lab Test: Traffic surge increases effective severity and risk', () => {
  // Baseline run
  const baseResult = runWhatIfSimulation('database', 'database-latency', {
    failureSeverity: 0.80,
    trafficLoadMultiplier: 1.0,
    retryMultiplier: 1.0,
    circuitBreakerEnabled: false,
    selectedStrategyId: 'db-failover',
  });

  // Surge run with 2.5x traffic and 3x retries
  const surgeResult = runWhatIfSimulation('database', 'database-latency', {
    failureSeverity: 0.80,
    trafficLoadMultiplier: 2.5,
    retryMultiplier: 3.0,
    circuitBreakerEnabled: false,
    selectedStrategyId: 'db-failover',
  });

  // Surge should have equal or higher risk score and smaller time to critical
  assert.ok(surgeResult.riskScore >= baseResult.riskScore);
  assert.ok(surgeResult.timeToCriticalMin <= baseResult.timeToCriticalMin);
});

test('What-If Lab Test: Circuit breaker dampens cascade impact', () => {
  const unshielded = runWhatIfSimulation('database', 'database-latency', {
    failureSeverity: 0.80,
    trafficLoadMultiplier: 2.0,
    retryMultiplier: 2.0,
    circuitBreakerEnabled: false,
    selectedStrategyId: 'db-failover',
  });

  const shielded = runWhatIfSimulation('database', 'database-latency', {
    failureSeverity: 0.80,
    trafficLoadMultiplier: 2.0,
    retryMultiplier: 2.0,
    circuitBreakerEnabled: true,
    selectedStrategyId: 'db-failover',
  });

  assert.ok(shielded.riskScore <= unshielded.riskScore);
});
