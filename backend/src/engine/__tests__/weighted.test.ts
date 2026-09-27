import { rankByWeightedScore } from '../weighted';
import { Candidate, ObjectiveDirection } from '../types';

describe('Weighted Scoring Fallback Engine', () => {
  const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE', 'MAXIMIZE'];

  const candidates: Candidate[] = [
    { id: '1', key: 'cheap_remote',  objectives: [10000, 60, 5] },  // Super cheap, terrible commute, low amenities
    { id: '2', key: 'balanced_mid',  objectives: [22000, 25, 15] }, // Moderate rent, decent commute, great amenities
    { id: '3', key: 'prime_central', objectives: [40000, 10, 25] }, // Expensive, amazing commute, top amenities
  ];

  test('computes scores within 0-100 range', () => {
    const result = rankByWeightedScore(candidates, directions);
    expect(result.ranked.length).toBe(3);
    for (const c of result.ranked) {
      expect(c.weightedScore).toBeDefined();
      expect(c.weightedScore!).toBeGreaterThanOrEqual(0);
      expect(c.weightedScore!).toBeLessThanOrEqual(100);
    }
  });

  test('heavily weighting rent alters top rank to cheap candidate', () => {
    // Heavy weight on rent (index 0)
    const rentBiasedWeights = [0.8, 0.1, 0.1];
    const result = rankByWeightedScore(candidates, directions, rentBiasedWeights);
    expect(result.ranked[0].key).toBe('cheap_remote');
  });

  test('heavily weighting commute alters top rank to prime candidate', () => {
    // Heavy weight on commute (index 1)
    const commuteBiasedWeights = [0.1, 0.8, 0.1];
    const result = rankByWeightedScore(candidates, directions, commuteBiasedWeights);
    expect(result.ranked[0].key).toBe('prime_central');
  });

  test('provides analytical commentary on trade-off limitations', () => {
    const result = rankByWeightedScore(candidates, directions);
    expect(result.tradeoffAnalysis).toContain('Weighted scoring aggregates multi-objective factors');
    expect(result.tradeoffAnalysis).toContain('Pareto optimization');
  });

  test('handles empty candidates array', () => {
    const result = rankByWeightedScore([], directions);
    expect(result.ranked).toEqual([]);
    expect(result.tradeoffAnalysis).toContain('No candidates');
  });
});
