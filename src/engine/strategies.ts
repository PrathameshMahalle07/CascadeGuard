import { ImpactLevel, RecoveryStrategy } from '../domain/types';

export const LEVEL_VALUES: Record<ImpactLevel, number> = {
  low: 0.15,
  medium: 0.50,
  high: 0.85,
};

export const WEIGHTS = {
  speed: 0.40,
  impact: 0.35,
  risk: 0.25,
};

/**
 * Calculates deterministic strategy score:
 * speed = 1 - recoverySec / 120
 * score = 100 * (0.40 * speed + 0.35 * (1 - impact) + 0.25 * (1 - risk))
 */
export function scoreStrategy(
  recoverySec: number,
  impact: ImpactLevel,
  risk: ImpactLevel
): number {
  const speed = 1 - recoverySec / 120;
  const impactVal = LEVEL_VALUES[impact];
  const riskVal = LEVEL_VALUES[risk];

  const rawScore = 100 * (
    WEIGHTS.speed * speed +
    WEIGHTS.impact * (1 - impactVal) +
    WEIGHTS.risk * (1 - riskVal)
  );

  return Math.round(rawScore);
}

export function rankStrategies(
  strategies: Omit<RecoveryStrategy, 'score'>[]
): { scored: RecoveryStrategy[]; recommendedId: string } {
  const scored: RecoveryStrategy[] = strategies.map((s) => ({
    ...s,
    score: scoreStrategy(s.recoverySec, s.impact, s.risk),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return {
    scored,
    recommendedId: scored[0].id,
  };
}
