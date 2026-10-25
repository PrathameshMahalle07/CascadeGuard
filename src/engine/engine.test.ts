import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePropagation } from './propagate';
import { scoreStrategy, rankStrategies } from './strategies';
import { calculateRiskScore } from './risk';
import { runDeterministicAnalysis } from './analyze';
import { SCENARIOS } from '../domain/scenarios';

test('Golden Propagation Test: database-latency at s=0.90', () => {
  const map = calculatePropagation('database', 0.90);

  // Check Payment: 82% (~4 min)
  const payment = map.get('payment');
  assert.ok(payment, 'Payment should be in propagation map');
  assert.equal(Math.round(payment.probability * 100), 82);
  assert.equal(payment.etaMin, 4);

  // Check Gateway: 67% (~6 min)
  const gateway = map.get('gateway');
  assert.ok(gateway, 'Gateway should be in propagation map');
  assert.equal(Math.round(gateway.probability * 100), 67);
  assert.equal(gateway.etaMin, 6);

  // Check Frontend: 41% (~8 min)
  const frontend = map.get('frontend');
  assert.ok(frontend, 'Frontend should be in propagation map');
  assert.equal(Math.round(frontend.probability * 100), 41);
  assert.equal(frontend.etaMin, 8);

  // Ensure un-impacted services remain healthy
  assert.equal(map.has('auth'), false);
  assert.equal(map.has('cache'), false);
  assert.equal(map.has('notification'), false);
  assert.equal(map.has('storage'), false);
});

test('Golden Strategy Scoring Test: hero set yields ~ 77 / 47 / 19', () => {
  const heroStrategies = SCENARIOS['database-latency'].strategies;
  const { scored, recommendedId } = rankStrategies(heroStrategies);

  const failover = scored.find((s) => s.id === 'db-failover');
  const reduction = scored.find((s) => s.id === 'traffic-reduction');
  const restart = scored.find((s) => s.id === 'service-restart');

  assert.ok(failover);
  assert.ok(reduction);
  assert.ok(restart);

  // Scores should be ~ 77 / 47 / 19
  assert.equal(failover.score, 77);
  assert.equal(reduction.score, 47);
  assert.equal(restart.score, 19);

  // Recommended should be Database Failover
  assert.equal(recommendedId, 'db-failover');
});

test('Cache Failure Scenario Test: cold restart does NOT win because of high downstream impact', () => {
  const cacheStrategies = SCENARIOS['cache-failure'].strategies;
  const { scored, recommendedId } = rankStrategies(cacheStrategies);

  // Fail over to replica should win over cold restart despite cold restart being 30s
  assert.equal(recommendedId, 'failover-cache-replica');
  const coldRestart = scored.find((s) => s.id === 'cold-restart-cache')!;
  const replica = scored.find((s) => s.id === 'failover-cache-replica')!;
  assert.ok(replica.score > coldRestart.score);
});

test('Golden Risk Score: hero scenario yields ~ 78 (HIGH)', () => {
  const analysis = runDeterministicAnalysis('database-latency');
  assert.equal(analysis.risk.score, 78);
  assert.equal(analysis.risk.level, 'HIGH');
  assert.equal(analysis.rootCause.confidence, 94);
});
