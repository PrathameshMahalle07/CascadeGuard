import { RiskLevel } from '../domain/types';

export function calculateRiskScore(
  probabilities: number[],
  severity: number
): { score: number; level: RiskLevel } {
  if (probabilities.length === 0) {
    return { score: 12, level: 'LOW' };
  }

  const sorted = [...probabilities].sort((a, b) => b - a);
  const maxP = sorted[0];

  const top3 = sorted.slice(0, 3);
  const meanTop3P = top3.reduce((acc, v) => acc + v, 0) / top3.length;

  const rawScore = 100 * (0.5 * maxP + 0.3 * meanTop3P + 0.2 * severity);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level: RiskLevel = 'LOW';
  if (score >= 85) {
    level = 'CRITICAL';
  } else if (score >= 70) {
    level = 'HIGH';
  } else if (score >= 40) {
    level = 'ELEVATED';
  }

  return { score, level };
}
