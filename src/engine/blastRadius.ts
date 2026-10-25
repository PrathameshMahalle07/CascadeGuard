import { BlastRadiusMetrics, ServiceId } from '../domain/types';
import { SERVICES } from '../domain/services';
import { calculatePropagation } from './propagate';

export function calculateBlastRadiusMetrics(
  origin: ServiceId,
  severity: number,
  recoverySec: number
): BlastRadiusMetrics {
  const propagationMap = calculatePropagation(origin, severity);
  const affectedDependents = Array.from(propagationMap.keys());
  const unmitigatedNodes = [origin, ...affectedDependents];

  // In unmitigated scenario, all dependent hops fail
  const totalUnmitigated = Math.max(1, unmitigatedNodes.length);

  // In mitigated scenario, only the origin service is impacted before isolation takes effect
  const totalMitigated = 1; // origin only

  const protectedCount = totalUnmitigated - totalMitigated;
  const avoidedPct = Math.round((protectedCount / totalUnmitigated) * 100);

  // Time comparison: time to unmitigated system crash vs recoverySec
  const maxEtaMin = Math.max(
    ...Array.from(propagationMap.values()).map((p) => p.etaMin),
    4
  );
  const crashSec = Math.round(maxEtaMin * 60 + 18);
  const timeSavedText = `${Math.floor(crashSec / 60)}m ${crashSec % 60}s → ${recoverySec}s`;

  const unmitigatedPath = unmitigatedNodes.map((id) => SERVICES[id]?.name || id);
  const mitigatedPath = [SERVICES[origin]?.name || origin, 'Fallback / Isolated', ...affectedDependents.map((id) => `${SERVICES[id]?.name} (Protected)`)];

  return {
    withoutInterventionCount: totalUnmitigated,
    withInterventionCount: totalMitigated,
    blastRadiusAvoidedPct: avoidedPct,
    servicesProtected: `${protectedCount}/${totalUnmitigated}`,
    timeSavedText,
    userImpactReductionPct: Math.min(96, Math.max(70, Math.round(avoidedPct * 1.15))),
    unmitigatedPath,
    mitigatedPath,
  };
}
