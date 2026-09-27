import { rankByPareto, dominates } from '../pareto';
import { rankByWeightedScore } from '../weighted';
import { Candidate, ObjectiveDirection } from '../types';
import { BANGALORE_NEIGHBORHOODS, PUNE_NEIGHBORHOODS, RawNeighborhoodData } from '../../data/cityData';
import { osrmService } from '../../services/osrm.service';

describe('Multi-City Engine Benchmark Tests (Bangalore & Pune Datasets)', () => {
  const directions: ObjectiveDirection[] = [
    'MINIMIZE', // Rent
    'MINIMIZE', // Commute
    'MINIMIZE', // AQI
    'MAXIMIZE', // Hospitals
    'MAXIMIZE'  // Groceries
  ];

  // =========================================================================
  // 1. BANGALORE DATASET (20 Micro-Markets)
  // =========================================================================
  describe('Bangalore Real Dataset Pareto & Weighted Tests', () => {
    // Workplace: RMZ Ecospace / Ecoworld (ORR) [lat 12.9279, lon 77.6848]
    const ecospaceLat = 12.9279;
    const ecospaceLon = 77.6848;

    const blrCandidates: Candidate[] = BANGALORE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => {
      const commute = osrmService.estimateFallback(
        n.centroid[1],
        n.centroid[0],
        ecospaceLat,
        ecospaceLon,
        'driving',
        n.metroConnected
      );
      return {
        id: String(n.key),
        key: n.key,
        objectives: [
          n.benchmarkRent1BHK,
          commute.durationMinutes,
          n.aqiBaseline,
          n.hospitalCount,
          n.groceryCount
        ]
      };
    });

    test('verifies Bangalore dataset contains exactly 20 micro-markets', () => {
      expect(blrCandidates.length).toBe(20);
    });

    test('Pareto engine extracts valid non-dominated frontier for Bangalore', () => {
      const result = rankByPareto(blrCandidates, directions);

      expect(result.paretoFrontier.length).toBeGreaterThan(0);
      expect(result.paretoFrontier.length).toBeLessThan(20); // Must partition into fronts

      // Verify Front 1 non-domination property: no member in Front 1 dominates another in Front 1
      const f1 = result.paretoFrontier;
      for (let i = 0; i < f1.length; i++) {
        for (let j = 0; j < f1.length; j++) {
          if (i !== j) {
            expect(dominates(f1[i].objectives, f1[j].objectives, directions)).toBe(false);
          }
        }
      }

      // Verify all Front 1 members have rank === 1
      for (const member of f1) {
        expect(member.rank).toBe(1);
        expect(member.crowdingDistance).toBeDefined();
        expect(member.crowdingDistance!).toBeGreaterThan(0);
      }

      // Verify every member in Front 2 is dominated by at least one member in Front 1
      if (result.fronts.length > 1) {
        const f2 = result.fronts[1];
        for (const f2Member of f2) {
          expect(f2Member.rank).toBe(2);
          const isDominatedByAnyF1 = f1.some(f1Member =>
            dominates(f1Member.objectives, f2Member.objectives, directions)
          );
          expect(isDominatedByAnyF1).toBe(true);
        }
      }
    });

    test('Weighted engine ranks Bangalore candidates with proper score bounds', () => {
      const result = rankByWeightedScore(blrCandidates, directions);
      expect(result.ranked.length).toBe(20);

      // Verify decreasing order of weighted score
      for (let i = 1; i < result.ranked.length; i++) {
        expect(result.ranked[i - 1].weightedScore!).toBeGreaterThanOrEqual(result.ranked[i].weightedScore!);
      }
    });

    test('Bangalore weighted engine adapts accurately to extreme user preferences', () => {
      // 1. Extreme Rent Bias (80% Rent)
      const rentBiasedResult = rankByWeightedScore(blrCandidates, directions, [0.8, 0.05, 0.05, 0.05, 0.05]);
      const topRent = rentBiasedResult.ranked[0];
      const cheapestBlrRent = Math.min(...BANGALORE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => n.benchmarkRent1BHK));
      expect(topRent.objectives[0]).toBe(cheapestBlrRent);

      // 2. Extreme Commute Bias (80% Commute to Ecospace)
      const commuteBiasedResult = rankByWeightedScore(blrCandidates, directions, [0.05, 0.8, 0.05, 0.05, 0.05]);
      const topCommute = commuteBiasedResult.ranked[0];
      expect(['bellandur', 'hsr_layout', 'marathahalli', 'sarjapur_road']).toContain(topCommute.key);
    });
  });

  // =========================================================================
  // 2. PUNE DATASET (16 Micro-Markets)
  // =========================================================================
  describe('Pune Real Dataset Pareto & Weighted Tests', () => {
    // Workplace: Rajiv Gandhi Infotech Park (Hinjawadi) [lat 18.5913, lon 73.7179]
    const hinjawadiLat = 18.5913;
    const hinjawadiLon = 73.7179;

    const puneCandidates: Candidate[] = PUNE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => {
      const commute = osrmService.estimateFallback(
        n.centroid[1],
        n.centroid[0],
        hinjawadiLat,
        hinjawadiLon,
        'driving',
        n.metroConnected
      );
      return {
        id: String(n.key),
        key: n.key,
        objectives: [
          n.benchmarkRent1BHK,
          commute.durationMinutes,
          n.aqiBaseline,
          n.hospitalCount,
          n.groceryCount
        ]
      };
    });

    test('verifies Pune dataset contains exactly 16 micro-markets', () => {
      expect(puneCandidates.length).toBe(16);
    });

    test('Pareto engine extracts valid non-dominated frontier for Pune', () => {
      const result = rankByPareto(puneCandidates, directions);

      expect(result.paretoFrontier.length).toBeGreaterThan(0);
      expect(result.paretoFrontier.length).toBeLessThan(16);

      // Verify mutual non-domination on Front 1
      const f1 = result.paretoFrontier;
      for (let i = 0; i < f1.length; i++) {
        for (let j = 0; j < f1.length; j++) {
          if (i !== j) {
            expect(dominates(f1[i].objectives, f1[j].objectives, directions)).toBe(false);
          }
        }
      }

      // Check key Pune archetypes are discovered on Front 1
      const f1Keys = f1.map(c => c.key);
      expect(f1Keys).toContain('hinjawadi_phase2_3');

      // Baner or Koregaon Park or Kothrud: high lifestyle/hospital count
      const hasAmenityLeader = f1Keys.some(k => ['baner', 'kothrud', 'koregaon_park', 'viman_nagar', 'wakad'].includes(k));
      expect(hasAmenityLeader).toBe(true);

      // Verify crowding distances assigned
      for (const member of f1) {
        expect(member.rank).toBe(1);
        expect(member.crowdingDistance).toBeDefined();
      }
    });

    test('Weighted engine ranks Pune candidates properly across weight profiles', () => {
      // 1. Rent-biased weights (80% Rent)
      const rentBiased = rankByWeightedScore(puneCandidates, directions, [0.8, 0.05, 0.05, 0.05, 0.05]);
      const topRent = rentBiased.ranked[0];
      const minPuneRent = Math.min(...PUNE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => n.benchmarkRent1BHK));
      expect(topRent.objectives[0]).toBe(minPuneRent);
      expect(topRent.key).toBe('hinjawadi_phase2_3');

      // 2. Commute-biased weights (80% Commute to Hinjawadi)
      const commuteBiased = rankByWeightedScore(puneCandidates, directions, [0.05, 0.8, 0.05, 0.05, 0.05]);
      const topCommute = commuteBiased.ranked[0];
      expect(['hinjawadi_phase1', 'hinjawadi_phase2_3', 'wakad', 'balewadi', 'punawale']).toContain(topCommute.key);

      // 3. Infrastructure & Healthcare biased (40% Hospitals + 40% Groceries)
      const amenityBiased = rankByWeightedScore(puneCandidates, directions, [0.05, 0.05, 0.1, 0.4, 0.4]);
      const topAmenity = amenityBiased.ranked[0];
      expect(['baner', 'kothrud', 'kalyani_nagar', 'viman_nagar', 'shivaji_nagar', 'aundh']).toContain(topAmenity.key);
    });

    test('Cross-city datasets are strictly isolated', () => {
      const blrKeys = new Set(BANGALORE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => n.key));
      const puneKeys = new Set(PUNE_NEIGHBORHOODS.map((n: RawNeighborhoodData) => n.key));

      // Disjoint sets
      for (const key of blrKeys) {
        expect(puneKeys.has(key)).toBe(false);
      }
      for (const key of puneKeys) {
        expect(blrKeys.has(key)).toBe(false);
      }
    });
  });
});
