import { dominates, fastNonDominatedSort, calculateCrowdingDistances, rankByPareto } from '../pareto';
import { Candidate, ObjectiveDirection } from '../types';

describe('Pareto Optimization Engine', () => {
  describe('Dominance Function', () => {
    const minDirs: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE'];

    test('candidate with strictly better values in all objectives dominates', () => {
      const a = [20000, 20]; // 20k rent, 20m commute
      const b = [30000, 45]; // 30k rent, 45m commute
      expect(dominates(a, b, minDirs)).toBe(true);
      expect(dominates(b, a, minDirs)).toBe(false);
    });

    test('candidate with equal in one objective and strictly better in another dominates', () => {
      const a = [20000, 20];
      const b = [20000, 35];
      expect(dominates(a, b, minDirs)).toBe(true);
      expect(dominates(b, a, minDirs)).toBe(false);
    });

    test('trade-off candidates do not dominate each other', () => {
      const a = [15000, 45]; // Cheaper, longer commute
      const b = [35000, 15]; // Pricier, shorter commute
      expect(dominates(a, b, minDirs)).toBe(false);
      expect(dominates(b, a, minDirs)).toBe(false);
    });

    test('identical objective vectors do not dominate each other', () => {
      const a = [25000, 30];
      const b = [25000, 30];
      expect(dominates(a, b, minDirs)).toBe(false);
      expect(dominates(b, a, minDirs)).toBe(false);
    });

    test('handles mixed minimization and maximization objectives correctly', () => {
      // Directions: Rent (MIN), Commute (MIN), Hospitals (MAX), Groceries (MAX)
      const mixedDirs: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE', 'MAXIMIZE', 'MAXIMIZE'];
      const superior = [18000, 25, 12, 20];
      const inferior = [24000, 35, 6, 10];
      expect(dominates(superior, inferior, mixedDirs)).toBe(true);
      expect(dominates(inferior, superior, mixedDirs)).toBe(false);
    });
  });

  describe('Fast Non-Dominated Sorting (Deb Algorithm)', () => {
    test('partitions candidates into proper Pareto fronts in a 2D trade-off', () => {
      const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE'];
      const candidates: Candidate[] = [
        { id: '1', key: 'koramangala', objectives: [35000, 15] },
        { id: '2', key: 'indiranagar',  objectives: [38000, 12] },
        { id: '3', key: 'whitefield',   objectives: [18000, 45] },
        { id: '4', key: 'hsr_layout',   objectives: [28000, 20] },
        { id: '5', key: 'suboptimal_1', objectives: [42000, 50] }, // Dominated by all
        { id: '6', key: 'suboptimal_2', objectives: [30000, 25] }, // Dominated by HSR (28k, 20m)
      ];

      const fronts = fastNonDominatedSort(candidates, directions);

      expect(fronts.length).toBeGreaterThanOrEqual(2);

      // Front 1 keys should only be non-dominated candidates
      const front1Keys = fronts[0].map(c => c.key);
      expect(front1Keys).toContain('koramangala');
      expect(front1Keys).toContain('indiranagar');
      expect(front1Keys).toContain('whitefield');
      expect(front1Keys).toContain('hsr_layout');
      expect(front1Keys).not.toContain('suboptimal_1');
      expect(front1Keys).not.toContain('suboptimal_2');
    });

    test('handles 5D multi-factor NestFit scenario', () => {
      // Rent(MIN), Commute(MIN), AQI(MIN), Hospitals(MAX), Groceries(MAX)
      const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE', 'MINIMIZE', 'MAXIMIZE', 'MAXIMIZE'];
      const candidates: Candidate[] = [
        { id: '1', key: 'jayanagar',   objectives: [30000, 30, 60, 20, 30] }, // Great AQI and amenities
        { id: '2', key: 'bellandur',   objectives: [25000, 10, 110, 8, 20] }, // Great commute to ORR, worse AQI
        { id: '3', key: 'yelahanka',   objectives: [14000, 50, 45, 6, 12] },  // Cheap rent, clean air, long commute
        { id: '4', key: 'dominated',   objectives: [32000, 15, 120, 5, 15] }, // Strictly worse than Bellandur
      ];

      const result = rankByPareto(candidates, directions);

      expect(result.paretoFrontier.length).toBe(3);
      const frontierKeys = result.paretoFrontier.map(c => c.key);
      expect(frontierKeys).toContain('jayanagar');
      expect(frontierKeys).toContain('bellandur');
      expect(frontierKeys).toContain('yelahanka');
      expect(frontierKeys).not.toContain('dominated');

      // Verify rank assignment
      const dominated = result.ranked.find(c => c.key === 'dominated');
      expect(dominated?.rank).toBeGreaterThan(1);
    });
  });

  describe('Crowding Distance & Diversity', () => {
    test('assigns infinity to boundary candidates and positive values to intermediate', () => {
      const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE'];
      const front: Candidate[] = [
        { id: '1', key: 'p1', objectives: [10, 100] },
        { id: '2', key: 'p2', objectives: [20, 80] },
        { id: '3', key: 'p3', objectives: [50, 40] },
        { id: '4', key: 'p4', objectives: [100, 10] },
      ];

      calculateCrowdingDistances(front, directions);

      const p1 = front.find(c => c.key === 'p1');
      const p4 = front.find(c => c.key === 'p4');
      const p2 = front.find(c => c.key === 'p2');
      const p3 = front.find(c => c.key === 'p3');

      expect(p1?.crowdingDistance).toBe(Infinity);
      expect(p4?.crowdingDistance).toBe(Infinity);
      expect(p2?.crowdingDistance).toBeGreaterThan(0);
      expect(p3?.crowdingDistance).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty candidates array gracefully', () => {
      const directions: ObjectiveDirection[] = ['MINIMIZE'];
      const result = rankByPareto([], directions);
      expect(result.fronts).toEqual([]);
      expect(result.ranked).toEqual([]);
      expect(result.paretoFrontier).toEqual([]);
    });

    test('handles single candidate population', () => {
      const directions: ObjectiveDirection[] = ['MINIMIZE', 'MAXIMIZE'];
      const single: Candidate[] = [
        { id: '1', key: 'only_one', objectives: [20000, 15] }
      ];

      const result = rankByPareto(single, directions);
      expect(result.ranked.length).toBe(1);
      expect(result.ranked[0].rank).toBe(1);
      expect(result.ranked[0].crowdingDistance).toBe(Infinity);
    });

    test('handles identical duplicate candidates without infinite loops', () => {
      const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE'];
      const duplicates: Candidate[] = [
        { id: '1', key: 'copy1', objectives: [20000, 30] },
        { id: '2', key: 'copy2', objectives: [20000, 30] },
      ];

      const result = rankByPareto(duplicates, directions);
      expect(result.ranked.length).toBe(2);
      expect(result.ranked[0].rank).toBe(1);
      expect(result.ranked[1].rank).toBe(1);
    });
  });

  describe('Low-Variance & Sparse Dataset Behavior (Raipur Investigation)', () => {
    // 4D objectives without rent: [Commute(MIN), AQI(MIN), Hospitals(MAX), Groceries(MAX)]
    const directions: ObjectiveDirection[] = ['MINIMIZE', 'MINIMIZE', 'MAXIMIZE', 'MAXIMIZE'];

    test('collapses to 1D optimization when 3 of 4 objectives have zero variance', () => {
      // 9 synthetic grid points where AQI=84, Hosp=4, Groc=4 for all points
      const uniformCandidates: Candidate[] = [
        { id: '1', key: 'cell_closest', objectives: [10, 84, 4, 4] },
        { id: '2', key: 'cell_2',       objectives: [15, 84, 4, 4] },
        { id: '3', key: 'cell_3',       objectives: [20, 84, 4, 4] },
        { id: '4', key: 'cell_4',       objectives: [25, 84, 4, 4] },
        { id: '5', key: 'cell_5',       objectives: [30, 84, 4, 4] },
        { id: '6', key: 'cell_6',       objectives: [35, 84, 4, 4] },
        { id: '7', key: 'cell_7',       objectives: [40, 84, 4, 4] },
        { id: '8', key: 'cell_8',       objectives: [45, 84, 4, 4] },
        { id: '9', key: 'cell_9',       objectives: [50, 84, 4, 4] }
      ];

      const result = rankByPareto(uniformCandidates, directions);

      // Mathematically, cell_closest strictly dominates all other 8 cells
      // because commute 10 < commute 15..50 and other objectives are tied.
      expect(result.paretoFrontier).toHaveLength(1);
      expect(result.paretoFrontier[0].key).toBe('cell_closest');
      expect(result.dominated).toHaveLength(8);
    });

    test('retains exactly the trade-off candidates when slight variance exists', () => {
      // 9 candidates where cell_1 has lowest commute, but cell_2 has slightly better healthcare
      const lowVarianceCandidates: Candidate[] = [
        { id: '1', key: 'cell_fastest_commute', objectives: [12, 85, 4, 4] },
        { id: '2', key: 'cell_better_hospital',  objectives: [16, 85, 6, 4] }, // Trade-off: +4m commute for +2 hospitals
        { id: '3', key: 'cell_dominated_1',     objectives: [22, 85, 4, 4] }, // Dominated by cell 1
        { id: '4', key: 'cell_dominated_2',     objectives: [26, 85, 5, 4] }, // Dominated by cell 2 (worse commute AND fewer hosp)
        { id: '5', key: 'cell_dominated_3',     objectives: [30, 85, 4, 4] },
        { id: '6', key: 'cell_dominated_4',     objectives: [35, 85, 4, 4] },
        { id: '7', key: 'cell_dominated_5',     objectives: [40, 85, 4, 4] },
        { id: '8', key: 'cell_dominated_6',     objectives: [45, 85, 4, 4] },
        { id: '9', key: 'cell_dominated_7',     objectives: [50, 85, 4, 4] }
      ];

      const result = rankByPareto(lowVarianceCandidates, directions);

      // Frontier mathematically has exactly 2 candidates!
      expect(result.paretoFrontier).toHaveLength(2);
      const frontierKeys = result.paretoFrontier.map(c => c.key);
      expect(frontierKeys).toContain('cell_fastest_commute');
      expect(frontierKeys).toContain('cell_better_hospital');
      expect(result.dominated).toHaveLength(7);
    });
  });
});
