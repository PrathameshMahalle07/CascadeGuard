import { ServiceId, DependencyEdge } from '../domain/types';
import { DEPENDENCY_EDGES } from '../domain/services';

export interface PropagationResult {
  serviceId: ServiceId;
  probability: number;
  etaMin: number;
  hop: number;
}

/**
 * Calculates failure propagation backwards along edges:
 * from a failing dependency (to) to its dependents (from).
 *
 * p(origin) = severity s
 * for each dependent d of node n, breadth-first by hop:
 *   p(d) = max(p(d), p(n) * weight(d->n) * 0.96)
 *   eta_min(hop) = (2 + 2*hop) * (0.9 / s)
 *   show only p >= 0.20
 */
export function calculatePropagation(
  origin: ServiceId,
  severity: number,
  edges: DependencyEdge[] = DEPENDENCY_EDGES
): Map<ServiceId, PropagationResult> {
  const results = new Map<ServiceId, PropagationResult>();

  // Map each dependency to its dependents (edges where edge.to is dependency, edge.from is dependent)
  const dependentsMap = new Map<ServiceId, { dependent: ServiceId; weight: number }[]>();
  for (const edge of edges) {
    const list = dependentsMap.get(edge.to) || [];
    list.push({ dependent: edge.from, weight: edge.weight });
    dependentsMap.set(edge.to, list);
  }

  // Queue holds: { serviceId, prob, hop }
  const queue: { serviceId: ServiceId; prob: number; hop: number }[] = [
    { serviceId: origin, prob: severity, hop: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = dependentsMap.get(current.serviceId) || [];

    for (const { dependent, weight } of dependents) {
      const nextHop = current.hop + 1;
      // Formula: p(d) = p(n) * weight(d->n) * 0.96
      const propagatedProb = current.prob * weight * 0.96;
      const etaMin = Math.round(((2 + 2 * nextHop) * (0.9 / severity)) * 10) / 10;

      const existing = results.get(dependent);
      if (!existing || propagatedProb > existing.probability) {
        if (propagatedProb >= 0.20) {
          results.set(dependent, {
            serviceId: dependent,
            probability: propagatedProb,
            etaMin: Math.round(etaMin),
            hop: nextHop,
          });
          queue.push({
            serviceId: dependent,
            prob: propagatedProb,
            hop: nextHop,
          });
        }
      }
    }
  }

  return results;
}
