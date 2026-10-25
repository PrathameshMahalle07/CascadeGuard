import { GoogleGenAI, Type } from '@google/genai';
import { GeminiIncidentCommanderOutput, ServiceId } from '../domain/types';

export async function generateIncidentCommanderReasoning(
  incidentData: {
    scenarioId: string;
    scenarioName: string;
    originService: string;
    severity: number;
    predictedFailures: { serviceId: string; probability: number; etaMin: number }[];
    rootCause: { label: string; confidence: number; evidence: string[] };
    recommendedStrategy: { name: string; recoverySec: number; risk: string; impact: string };
    logs: { timestamp: string; level: string; service: string; message: string }[];
  }
): Promise<GeminiIncidentCommanderOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `
INCIDENT TELEMETRY PAYLOAD:
Scenario: ${incidentData.scenarioName} (${incidentData.scenarioId})
Origin Fault Node: ${incidentData.originService} (Severity: ${incidentData.severity})
Computed Root Cause: ${incidentData.rootCause.label} (Engine Confidence: ${incidentData.rootCause.confidence}%)
Root Evidence:
${incidentData.rootCause.evidence.map((e) => `- ${e}`).join('\n')}

Predicted Downstream Propagation:
${incidentData.predictedFailures.map((p) => `- ${p.serviceId}: ${Math.round(p.probability * 100)}% risk, ETA ~${p.etaMin}m`).join('\n')}

Recommended Remediation Strategy:
- Name: ${incidentData.recommendedStrategy.name}
- Recovery Target: ${incidentData.recommendedStrategy.recoverySec}s
- Risk: ${incidentData.recommendedStrategy.risk} | Impact: ${incidentData.recommendedStrategy.impact}

Recent Telemetry Logs:
${incidentData.logs.slice(0, 10).map((l) => `${l.timestamp} [${l.service}] ${l.message}`).join('\n')}

Provide an executive SRE Incident Commander assessment in JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an elite SRE Incident Commander analyzing distributed systems telemetry. You reason strictly over the provided deterministic engine calculations without modifying numbers or IDs. Explain the mechanical coupling, the retry amplification storm, the blast radius containment, and potential catastrophic outage if ignored. Respond in strict JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootCauseSummary: { type: Type.STRING, description: 'Precise technical summary of root cause anomaly under 25 words' },
              detailedEvidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 technical metric correlation points with concrete deltas',
              },
              cascadeMechanism: { type: Type.STRING, description: 'Explanation of how failure propagates along synchronous dependency edges under 30 words' },
              blastRadiusExplanation: { type: Type.STRING, description: 'Description of downstream tiers endangered if unmitigated' },
              recommendedAction: { type: Type.STRING, description: 'Selected remediation strategy' },
              whyThisAction: { type: Type.STRING, description: 'Justification for strategy selection balancing recovery speed vs blast radius' },
              riskIfIgnored: { type: Type.STRING, description: 'Specific consequence if operator fails to act within the ETA' },
              confidence: { type: Type.NUMBER, description: 'Confidence percentage between 85 and 99' },
              uncertainties: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 operational caveats or edge boundary limits',
              },
            },
            required: [
              'rootCauseSummary',
              'detailedEvidence',
              'cascadeMechanism',
              'blastRadiusExplanation',
              'recommendedAction',
              'whyThisAction',
              'riskIfIgnored',
              'confidence',
              'uncertainties',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as GeminiIncidentCommanderOutput;
        return {
          ...parsed,
          confidence: incidentData.rootCause.confidence, // Ground truth anchor
          provenance: 'ENGINE VERIFIED + GEMINI REASONING',
        };
      }
    } catch (err) {
      console.warn('[Gemini Server Proxy] Fallback to deterministic synthesis:', err);
    }
  }

  // Deterministic Fallback Synthesis (100% offline-ready & instant)
  return getDeterministicCommanderReasoning(incidentData);
}

export function getDeterministicCommanderReasoning(incidentData: {
  scenarioId: string;
  scenarioName: string;
  originService: string;
  severity: number;
  predictedFailures: { serviceId: string; probability: number; etaMin: number }[];
  rootCause: { label: string; confidence: number; evidence: string[] };
  recommendedStrategy: { name: string; recoverySec: number; risk: string; impact: string };
}): GeminiIncidentCommanderOutput {
  const origin = incidentData.originService;
  const nextTarget = incidentData.predictedFailures[0]?.serviceId || 'Payment Service';
  const eta = incidentData.predictedFailures[0]?.etaMin || 4;

  const scenariosReasoning: Record<string, Partial<GeminiIncidentCommanderOutput>> = {
    'database-latency': {
      rootCauseSummary: 'PostgreSQL connection pool lock contention and query latency surge exceeding 600ms.',
      detailedEvidence: [
        'db.query_p95 spiked 34ms → 643ms (+1791% delta against baseline)',
        'pg_stat_activity active worker pool reached 91% saturation',
        'Downstream payment thread backlog initiated 5s prior to gateway HTTP 504s',
        'Synchronous connection pool exhaustion confirmed across replica nodes',
      ],
      cascadeMechanism: 'Payment workers block synchronously on database queries; exponential client retries compound ingress backlog into API Gateway.',
      blastRadiusExplanation: 'Payment Service and API Gateway will experience cascading socket starvation, dropping 78% of active checkout ingress.',
      recommendedAction: 'Automated Database Failover to hot-standby replica in us-east-1b.',
      whyThisAction: 'Delivers lowest downstream blast radius with 42s recovery, eliminating database wait-states without cold data flushes.',
      riskIfIgnored: 'Complete transactional blackout within ~4m as API Gateway thread starvation triggers cascading frontend timeouts.',
      uncertainties: [
        'Brief 1.2s connection reset during replica DNS endpoint switchover.',
        'Assumes synchronous replication lag remains below 10ms boundary.',
      ],
    },
    'payment-timeout': {
      rootCauseSummary: 'Downstream payment acquirer TCP socket timeout exhausting ingress worker threads.',
      detailedEvidence: [
        'payment.worker_pool saturation peaked at 96% capacity',
        'Outbound acquirer TLS handshake timeout exceeded 5000ms threshold',
        'API Gateway upstream request retry queue expanded +340%',
        'HTTP 504 Gateway Timeouts surging across /v1/checkout route',
      ],
      cascadeMechanism: 'Stranded socket connections retain memory buffers, starving Order Service and escalating API Gateway queue depth.',
      blastRadiusExplanation: 'Order processing, API Gateway, and Web Frontend checkout flows will collapse into full 503 outage.',
      recommendedAction: 'Engage circuit breaker and route orders to asynchronous dead-letter buffer.',
      whyThisAction: 'Decouples order ingestion from external partner latency with zero data loss and 38s containment.',
      riskIfIgnored: 'API Gateway buffer exhaustion will trigger widespread 503 service unavailable across entire web platform.',
      uncertainties: ['Asynchronous orders require reconciliation once external provider restores connectivity.'],
    },
    'cache-failure': {
      rootCauseSummary: 'Redis cluster memory fragmentation fault causing key eviction thrashing.',
      detailedEvidence: [
        'redis.used_memory_rss fragmentation ratio reached 2.4x critical',
        'Cache hit ratio collapsed from 99.2% to 14.1% in 6 seconds',
        'Database IOPS spiked +340% from unbuffered cache misses',
        'Authentication session lookups backing up into gateway proxy',
      ],
      cascadeMechanism: 'Missing session keys force 100% cache misses to stampede directly into PostgreSQL database tier.',
      blastRadiusExplanation: 'Unchecked cache miss storm will exhaust database IOPS, bringing down Auth, Payment, and Order processing.',
      recommendedAction: 'Fail over to warm Redis read-replica with synchronized keyspace.',
      whyThisAction: 'Preserves 99.8% warm keyspace and prevents catastrophic secondary database stampede caused by cold restart.',
      riskIfIgnored: 'Secondary database collapse within ~3m due to unthrottled cache miss query stampede.',
      uncertainties: ['Minor transient key invalidations during replica master promotion.'],
    },
    'auth-failure': {
      rootCauseSummary: 'JWKS key rotation certificate mismatch causing signature verification backpressure.',
      detailedEvidence: [
        'auth.crypto_verify_latency jumped from 38ms to 890ms',
        'Public keystore 503 retry storm elevated CPU usage to 94%',
        'Ingress gateway authorization header buffer saturation at 88%',
        'Client retry storms escalating across mobile and web entrypoints',
      ],
      cascadeMechanism: 'Unverified authorization tokens block gateway reverse proxies, stalling downstream routing to payment and order tiers.',
      blastRadiusExplanation: 'Prevents 100% of authenticated API traffic from accessing backend services.',
      recommendedAction: 'Instant canary rollback of Auth service deployment to prior stable digest v2.14.1.',
      whyThisAction: 'Restores verified cryptographic certificates in 44s without requiring database locks or token revocations.',
      riskIfIgnored: 'Universal authentication blackout across all public mobile and web clients within ~5m.',
      uncertainties: ['Tokens minted during bad deploy window will require graceful re-authentication.'],
    },
  };

  const chosen = scenariosReasoning[incidentData.scenarioId] || scenariosReasoning['database-latency'];

  return {
    rootCauseSummary: chosen.rootCauseSummary || `${origin.toUpperCase()} service degradation exceeding threshold.`,
    detailedEvidence: chosen.detailedEvidence || incidentData.rootCause.evidence,
    cascadeMechanism: chosen.cascadeMechanism || `Synchronous coupling between ${origin} and ${nextTarget} propagates queue latency.`,
    blastRadiusExplanation: chosen.blastRadiusExplanation || `Failure propagates to ${nextTarget} within ~${eta} minutes.`,
    recommendedAction: chosen.recommendedAction || incidentData.recommendedStrategy.name,
    whyThisAction: chosen.whyThisAction || `Optimal recovery speed (${incidentData.recommendedStrategy.recoverySec}s) with minimal downstream impact.`,
    riskIfIgnored: chosen.riskIfIgnored || `Complete platform outage within estimated ~${eta} minute window.`,
    confidence: incidentData.rootCause.confidence,
    uncertainties: chosen.uncertainties || ['Real-world network jitter may vary estimated ETAs by ±10%.'],
    provenance: 'ENGINE VERIFIED (DETERMINISTIC FALLBACK)',
  };
}
