import { computeComparisonDeltas, NeighborhoodComparisonInput } from '../compare';

describe('Compare Mode Delta Calculation Engine', () => {
  describe('Known Pair: Bangalore Micro-Markets (Electronic City Phase 2 vs Yelahanka)', () => {
    const eCityPhase2: NeighborhoodComparisonInput = {
      key: 'electronic_city_phase2',
      name: 'Electronic City Phase 2',
      rent: 9500,
      commuteMinutes: 24,
      aqi: 92,
      hospitalCount: 5,
      groceryCount: 14
    };

    const yelahanka: NeighborhoodComparisonInput = {
      key: 'yelahanka',
      name: 'Yelahanka',
      rent: 11500,
      commuteMinutes: 53,
      aqi: 48,
      hospitalCount: 8,
      groceryCount: 21
    };

    const summary = computeComparisonDeltas([eCityPhase2, yelahanka]);

    test('correctly identifies global minimums/maximums across candidate set', () => {
      expect(summary.minRent).toBe(9500);
      expect(summary.minCommute).toBe(24);
      expect(summary.bestAqi).toBe(48);
      expect(summary.maxHospitals).toBe(8);
      expect(summary.maxGroceries).toBe(21);
    });

    test('correctly computes rent differences and best rent flag', () => {
      const eCityResult = summary.results['electronic_city_phase2'];
      const yelResult = summary.results['yelahanka'];

      // Electronic City Phase 2 is cheaper
      expect(eCityResult.rent.isBest).toBe(true);
      expect(eCityResult.rent.delta).toBe(0);
      expect(eCityResult.rent.formattedDelta).toBe('Best Rent');

      // Yelahanka is 2,000 more expensive
      expect(yelResult.rent.isBest).toBe(false);
      expect(yelResult.rent.delta).toBe(2000);
      expect(yelResult.rent.formattedDelta).toBe('+₹2,000/mo');
    });

    test('correctly computes commute differences and best commute flag', () => {
      const eCityResult = summary.results['electronic_city_phase2'];
      const yelResult = summary.results['yelahanka'];

      // Electronic City Phase 2 is 24m vs 53m
      expect(eCityResult.commute.isBest).toBe(true);
      expect(eCityResult.commute.delta).toBe(0);
      expect(eCityResult.commute.formattedDelta).toBe('Fastest Commute');

      // Yelahanka is 29 mins slower
      expect(yelResult.commute.isBest).toBe(false);
      expect(yelResult.commute.delta).toBe(29);
      expect(yelResult.commute.formattedDelta).toBe('+29m slower');
    });

    test('correctly computes air quality (AQI) differences and best AQI flag', () => {
      const eCityResult = summary.results['electronic_city_phase2'];
      const yelResult = summary.results['yelahanka'];

      // Yelahanka has superior AQI (48 vs 92)
      expect(yelResult.aqi.isBest).toBe(true);
      expect(yelResult.aqi.delta).toBe(0);
      expect(yelResult.aqi.formattedDelta).toBe('Cleanest Air');

      // Electronic City Phase 2 has 44 higher AQI (worse air)
      expect(eCityResult.aqi.isBest).toBe(false);
      expect(eCityResult.aqi.delta).toBe(44);
      expect(eCityResult.aqi.formattedDelta).toBe('+44 AQI higher');
    });

    test('correctly computes amenity advantages (hospitals and groceries)', () => {
      const eCityResult = summary.results['electronic_city_phase2'];
      const yelResult = summary.results['yelahanka'];

      // Yelahanka has more hospitals (8 vs 5)
      expect(yelResult.hospitals.isBest).toBe(true);
      expect(yelResult.hospitals.delta).toBe(0);
      expect(eCityResult.hospitals.isBest).toBe(false);
      expect(eCityResult.hospitals.delta).toBe(-3);
      expect(eCityResult.hospitals.formattedDelta).toBe('-3 fewer');

      // Yelahanka has more grocery stores (21 vs 14)
      expect(yelResult.groceries.isBest).toBe(true);
      expect(yelResult.groceries.delta).toBe(0);
      expect(eCityResult.groceries.isBest).toBe(false);
      expect(eCityResult.groceries.delta).toBe(-7);
      expect(eCityResult.groceries.formattedDelta).toBe('-7 fewer');
    });
  });

  describe('Known Triplet: Pune Micro-Markets (Hinjawadi Ph 2/3 vs Wakad vs Baner)', () => {
    const hinjawadi: NeighborhoodComparisonInput = {
      key: 'hinjawadi_phase2_3',
      name: 'Hinjawadi Phase 2 & 3',
      rent: 11000,
      commuteMinutes: 8,
      aqi: 55,
      hospitalCount: 5,
      groceryCount: 16
    };

    const wakad: NeighborhoodComparisonInput = {
      key: 'wakad',
      name: 'Wakad',
      rent: 16000,
      commuteMinutes: 18,
      aqi: 72,
      hospitalCount: 12,
      groceryCount: 28
    };

    const baner: NeighborhoodComparisonInput = {
      key: 'baner',
      name: 'Baner',
      rent: 20000,
      commuteMinutes: 26,
      aqi: 70,
      hospitalCount: 14,
      groceryCount: 30
    };

    const summary = computeComparisonDeltas([hinjawadi, wakad, baner]);

    test('evaluates 3-way Pareto trade-off accurately', () => {
      expect(summary.minRent).toBe(11000);
      expect(summary.minCommute).toBe(8);
      expect(summary.bestAqi).toBe(55);
      expect(summary.maxHospitals).toBe(14);
      expect(summary.maxGroceries).toBe(30);

      // Hinjawadi dominates in price, commute to RGIP, and mountain air
      const hj = summary.results['hinjawadi_phase2_3'];
      expect(hj.rent.isBest).toBe(true);
      expect(hj.commute.isBest).toBe(true);
      expect(hj.aqi.isBest).toBe(true);
      expect(hj.hospitals.isBest).toBe(false);

      // Baner dominates in high-density urban infrastructure and lifestyle
      const bn = summary.results['baner'];
      expect(bn.hospitals.isBest).toBe(true);
      expect(bn.groceries.isBest).toBe(true);
      expect(bn.rent.delta).toBe(9000); // 20k vs 11k
      expect(bn.commute.delta).toBe(18); // 26m vs 8m

      // Wakad sits directly as intermediate compromise
      const wk = summary.results['wakad'];
      expect(wk.rent.delta).toBe(5000);
      expect(wk.commute.delta).toBe(10);
      expect(wk.hospitals.delta).toBe(-2); // 12 vs 14
      expect(wk.groceries.delta).toBe(-2); // 28 vs 30
    });
  });

  describe('Edge Cases', () => {
    test('handles empty input list', () => {
      const summary = computeComparisonDeltas([]);
      expect(summary.areas).toEqual([]);
      expect(summary.minRent).toBe(0);
    });

    test('handles identical twin neighborhoods', () => {
      const a1: NeighborhoodComparisonInput = {
        key: 'twin1',
        name: 'Twin 1',
        rent: 15000,
        commuteMinutes: 20,
        aqi: 60,
        hospitalCount: 10,
        groceryCount: 20
      };
      const a2: NeighborhoodComparisonInput = {
        key: 'twin2',
        name: 'Twin 2',
        rent: 15000,
        commuteMinutes: 20,
        aqi: 60,
        hospitalCount: 10,
        groceryCount: 20
      };

      const summary = computeComparisonDeltas([a1, a2]);
      expect(summary.results['twin1'].rent.isBest).toBe(true);
      expect(summary.results['twin2'].rent.isBest).toBe(true);
      expect(summary.results['twin1'].rent.delta).toBe(0);
      expect(summary.results['twin2'].rent.delta).toBe(0);
      expect(summary.results['twin1'].commute.delta).toBe(0);
      expect(summary.results['twin2'].commute.delta).toBe(0);
    });

    test('handles single candidate without divide-by-zero or NaN', () => {
      const single: NeighborhoodComparisonInput = {
        key: 'lone_wolf',
        name: 'Lone Wolf',
        rent: 18000,
        commuteMinutes: 15,
        aqi: 50,
        hospitalCount: 6,
        groceryCount: 10
      };

      const summary = computeComparisonDeltas([single]);
      expect(summary.areas.length).toBe(1);
      expect(summary.results['lone_wolf'].rent.isBest).toBe(true);
      expect(summary.results['lone_wolf'].rent.delta).toBe(0);
    });
  });
});
