import { ServiceId } from '../domain/types';

export interface RootCauseAnalysis {
  serviceId: ServiceId;
  label: string;
  confidence: number;
  evidence: string[];
}

export function determineRootCause(
  origin: ServiceId,
  severity: number,
  scenarioId: string
): RootCauseAnalysis {
  switch (scenarioId) {
    case 'database-latency':
      return {
        serviceId: 'database',
        label: 'Database Latency Spike',
        confidence: 94,
        evidence: [
          'db.query_p95 34→643ms (+1791%)',
          'pg_stat_activity pool_saturation 91%',
          'onset 5s before payment.retry_rate +18%',
        ],
      };
    case 'payment-timeout':
      return {
        serviceId: 'payment',
        label: 'Payment Gateway Thread Saturation',
        confidence: 91,
        evidence: [
          'payment.worker_pool_saturation 96%',
          'upstream_connect_timeout 5000ms exceeded',
          'onset 4s before gateway.http_504 +12%',
        ],
      };
    case 'cache-failure':
      return {
        serviceId: 'cache',
        label: 'Redis Cache Cluster Eviction Fault',
        confidence: 92,
        evidence: [
          'redis.used_memory_rss fragmentation 2.4x',
          'cache_hit_rate collapsed 99.2%→14.1%',
          'onset 6s before db.read_iops surge +340%',
        ],
      };
    case 'auth-failure':
      return {
        serviceId: 'auth',
        label: 'JWKS Verification Backpressure',
        confidence: 89,
        evidence: [
          'auth.crypto_verify_latency 38→890ms',
          'jwks_endpoint_503 retry_storm +240%',
          'onset 3s before gateway.auth_header_timeout',
        ],
      };
    default:
      return {
        serviceId: origin,
        label: `${origin.toUpperCase()} Service Degradation`,
        confidence: Math.round(severity * 100),
        evidence: [
          `${origin}.p95 latency spike detected`,
          `cascade vector propagating to dependents`,
          `anomalous thread exhaustion pattern`,
        ],
      };
  }
}
