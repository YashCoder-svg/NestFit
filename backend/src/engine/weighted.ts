import { Candidate, ObjectiveDirection } from './types';

export interface WeightedScoringResult {
  ranked: Candidate[];
  weightsUsed: number[];
  tradeoffAnalysis: string;
}

/**
 * Weighted Scoring fallback engine.
 * Computes a single scalar score (0-100) per candidate based on linear combination of normalized factors.
 */
export function rankByWeightedScore(
  candidates: Candidate[],
  directions: ObjectiveDirection[],
  weights?: number[]
): WeightedScoringResult {
  if (candidates.length === 0) {
    return {
      ranked: [],
      weightsUsed: [],
      tradeoffAnalysis: 'No candidates to evaluate.'
    };
  }

  const numObj = directions.length;
  // Default equal weights if none supplied
  const effectiveWeights = weights && weights.length === numObj
    ? weights
    : new Array(numObj).fill(1.0);

  const totalWeight = effectiveWeights.reduce((sum, w) => sum + w, 0);

  // Compute min and max for each objective across population
  const minVals: number[] = new Array(numObj).fill(Infinity);
  const maxVals: number[] = new Array(numObj).fill(-Infinity);

  for (const c of candidates) {
    for (let m = 0; m < numObj; m++) {
      if (c.objectives[m] < minVals[m]) minVals[m] = c.objectives[m];
      if (c.objectives[m] > maxVals[m]) maxVals[m] = c.objectives[m];
    }
  }

  // Deep clone candidates
  const scoredCandidates: Candidate[] = candidates.map(c => {
    let compositeScore = 0;

    for (let m = 0; m < numObj; m++) {
      const val = c.objectives[m];
      const minV = minVals[m];
      const maxV = maxVals[m];
      const range = maxV - minV;

      let normalized = 50.0; // default midpoint if all candidates identical
      if (Math.abs(range) > 1e-9) {
        if (directions[m] === 'MINIMIZE') {
          normalized = ((maxV - val) / range) * 100.0;
        } else {
          normalized = ((val - minV) / range) * 100.0;
        }
      }

      compositeScore += (normalized * effectiveWeights[m]) / totalWeight;
    }

    return {
      ...c,
      weightedScore: Math.round(compositeScore * 10) / 10
    };
  });

  // Sort by weightedScore descending
  scoredCandidates.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0));

  // Assign virtual rank based on position
  scoredCandidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  const tradeoffAnalysis = 
    `Weighted scoring aggregates multi-objective factors into a single scalar metric. ` +
    `While intuitive, it can conceal critical trade-offs (e.g. an area with a grueling 90-minute commute ` +
    `may rank higher than a balanced 25-minute neighborhood simply due to ultra-low rent). ` +
    `Pareto optimization instead preserves the non-dominated frontier without forcing arbitrary subjective weights.`;

  return {
    ranked: scoredCandidates,
    weightsUsed: effectiveWeights,
    tradeoffAnalysis
  };
}
