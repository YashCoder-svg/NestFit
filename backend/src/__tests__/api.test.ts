import request from 'supertest';
import app from '../index';

describe('NestFit Multi-City API Integration Tests', () => {
  // -------------------------------------------------------------------------
  // 1. Health & City Metadata
  // -------------------------------------------------------------------------
  test('GET /health returns healthy status with supported cities', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.supportedCities).toContain('bangalore');
    expect(res.body.supportedCities).toContain('pune');
  });

  test('GET /api/v1/meta/cities returns Bangalore and Pune with spatial metadata', async () => {
    const res = await request(app).get('/api/v1/meta/cities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    const cityMap = new Map<string, any>(res.body.map((c: any) => [c.id, c]));
    expect(cityMap.has('bangalore')).toBe(true);
    expect(cityMap.has('pune')).toBe(true);

    const blr = cityMap.get('bangalore');
    expect(blr.name).toBe('Bangalore');
    expect(blr.center).toEqual([12.9716, 77.5946]);
    expect(blr.metroLines.length).toBeGreaterThan(0);
    expect(blr.aqiStationsCount).toBe(9);

    const pune = cityMap.get('pune');
    expect(pune.name).toBe('Pune');
    expect(pune.center).toEqual([18.5204, 73.8567]);
    expect(pune.metroLines.length).toBeGreaterThan(0);
    expect(pune.aqiStationsCount).toBe(7);
  });

  // -------------------------------------------------------------------------
  // 2. City-Filtered Endpoints: /meta/workplaces (?city=bangalore vs ?city=pune)
  // -------------------------------------------------------------------------
  describe('Workplaces City-Filtering', () => {
    test('GET /api/v1/meta/workplaces?city=bangalore returns exactly 7 Bangalore tech hubs', async () => {
      const res = await request(app).get('/api/v1/meta/workplaces?city=bangalore');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(7);

      for (const wp of res.body) {
        expect(wp.city).toBe('bangalore');
        expect(wp.centroid).toBeDefined();
        expect(wp.centroid.length).toBe(2);
      }

      const keys = res.body.map((w: any) => w.key);
      expect(keys).toContain('ecospace_bellandur');
      expect(keys).toContain('manyata_tech_park');
      expect(keys).toContain('electronic_city_phase1');
    });

    test('GET /api/v1/meta/workplaces?city=pune returns exactly 6 Pune tech hubs', async () => {
      const res = await request(app).get('/api/v1/meta/workplaces?city=pune');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(6);

      for (const wp of res.body) {
        expect(wp.city).toBe('pune');
        expect(wp.centroid).toBeDefined();
        expect(wp.centroid.length).toBe(2);
      }

      const keys = res.body.map((w: any) => w.key);
      expect(keys).toContain('hinjawadi_rgip');
      expect(keys).toContain('eon_free_zone_kharadi');
      expect(keys).toContain('magarpatta_cybercity');
    });

    test('verifies Bangalore and Pune workplaces have zero key collision', async () => {
      const [blrRes, puneRes] = await Promise.all([
        request(app).get('/api/v1/meta/workplaces?city=bangalore'),
        request(app).get('/api/v1/meta/workplaces?city=pune')
      ]);

      const blrKeys = new Set(blrRes.body.map((w: any) => w.key));
      const puneKeys = new Set(puneRes.body.map((w: any) => w.key));

      for (const key of blrKeys) {
        expect(puneKeys.has(key)).toBe(false);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. City-Filtered Endpoints: /neighborhoods (?city=bangalore vs ?city=pune)
  // -------------------------------------------------------------------------
  describe('Neighborhoods City-Filtering', () => {
    test('GET /api/v1/neighborhoods?city=bangalore returns exactly 20 micro-markets', async () => {
      const res = await request(app).get('/api/v1/neighborhoods?city=bangalore');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(20);

      for (const n of res.body) {
        expect(n.city).toBe('bangalore');
        expect(n.centroid?.length).toBe(2);
        expect(n.polygon?.length).toBeGreaterThan(0);
        expect(n.benchmarkRent1BHK).toBeGreaterThan(5000);
      }
    });

    test('GET /api/v1/neighborhoods?city=pune returns exactly 16 micro-markets', async () => {
      const res = await request(app).get('/api/v1/neighborhoods?city=pune');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(16);

      for (const n of res.body) {
        expect(n.city).toBe('pune');
        expect(n.centroid?.length).toBe(2);
        expect(n.polygon?.length).toBeGreaterThan(0);
        expect(n.benchmarkRent1BHK).toBeGreaterThan(5000);
      }

      const keys = res.body.map((n: any) => n.key);
      expect(keys).toContain('hinjawadi_phase1');
      expect(keys).toContain('hinjawadi_phase2_3');
      expect(keys).toContain('wakad');
      expect(keys).toContain('baner');
      expect(keys).toContain('koregaon_park');
    });

    test('verifies complete spatial isolation between Bangalore and Pune micro-markets', async () => {
      const [blrRes, puneRes] = await Promise.all([
        request(app).get('/api/v1/neighborhoods?city=bangalore'),
        request(app).get('/api/v1/neighborhoods?city=pune')
      ]);

      const blrKeys = new Set(blrRes.body.map((n: any) => n.key));
      const puneKeys = new Set(puneRes.body.map((n: any) => n.key));

      for (const key of blrKeys) {
        expect(puneKeys.has(key)).toBe(false);
      }

      // Check coordinates latitude range: Bangalore ~12.8-13.1, Pune ~18.4-18.7
      for (const n of blrRes.body) {
        const lat = n.centroid[1];
        expect(lat).toBeGreaterThan(12.0);
        expect(lat).toBeLessThan(14.0);
      }

      for (const n of puneRes.body) {
        const lat = n.centroid[1];
        expect(lat).toBeGreaterThan(18.0);
        expect(lat).toBeLessThan(19.0);
      }
    });

    test('GET /api/v1/neighborhoods/:key fetches individual micro-market profile', async () => {
      // Bangalore micro-market
      const resIndira = await request(app).get('/api/v1/neighborhoods/indiranagar');
      expect(resIndira.status).toBe(200);
      expect(resIndira.body.name).toBe('Indiranagar');
      expect(resIndira.body.city).toBe('bangalore');

      // Pune micro-market
      const resBaner = await request(app).get('/api/v1/neighborhoods/baner');
      expect(resBaner.status).toBe(200);
      expect(resBaner.body.name).toBe('Baner');
      expect(resBaner.body.city).toBe('pune');

      // Non-existent micro-market
      const resNotFound = await request(app).get('/api/v1/neighborhoods/non_existent_area');
      expect(resNotFound.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Recommendation Engine: POST /api/v1/recommend for Bangalore and Pune
  // -------------------------------------------------------------------------
  describe('Recommendation Engine Multi-City Endpoint', () => {
    test('POST /api/v1/recommend runs Pareto optimization for Pune', async () => {
      const payload = {
        city: 'pune',
        workplace: {
          name: 'Rajiv Gandhi Infotech Park (Hinjawadi)',
          lat: 18.5913,
          lon: 73.7179
        },
        transitMode: 'driving',
        bedroomType: '1bhk',
        algorithm: 'pareto'
      };

      const res = await request(app).post('/api/v1/recommend').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.city).toBe('pune');
      expect(res.body.totalEvaluated).toBe(16);
      expect(res.body.paretoOptimalCount).toBeGreaterThan(0);
      expect(res.body.paretoFrontier.length).toBeGreaterThan(0);

      for (const item of res.body.paretoFrontier) {
        expect(item.city).toBe('pune');
        expect(item.rank).toBe(1);
        expect(item.isParetoOptimal).toBe(true);
        expect(item.radarScores).toBeDefined();
        expect(item.commuteMinutes).toBeGreaterThan(0);
      }
    });

    test('POST /api/v1/recommend runs Weighted Sum mode for Bangalore', async () => {
      const payload = {
        city: 'bangalore',
        workplace: {
          name: 'RMZ Ecospace / Ecoworld (ORR)',
          lat: 12.9279,
          lon: 77.6848
        },
        transitMode: 'driving',
        bedroomType: '2bhk',
        algorithm: 'weighted',
        weights: [0.5, 0.3, 0.1, 0.05, 0.05] // Heavily rent + commute
      };

      const res = await request(app).post('/api/v1/recommend').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.city).toBe('bangalore');
      expect(res.body.algorithmUsed).toBe('weighted');
      expect(res.body.totalEvaluated).toBe(20);
      expect(res.body.tradeoffAnalysis).toBeDefined();

      // Top candidate must have weightedScore
      expect(res.body.paretoFrontier[0].weightedScore).toBeDefined();
      expect(res.body.paretoFrontier[0].weightedScore).toBeGreaterThanOrEqual(0);
      expect(res.body.paretoFrontier[0].weightedScore).toBeLessThanOrEqual(100);
    });

    test('POST /api/v1/recommend applies hard constraints in Bangalore', async () => {
      const payload = {
        city: 'bangalore',
        workplace: {
          name: 'Manyata Tech Park',
          lat: 13.0489,
          lon: 77.6212
        },
        transitMode: 'driving',
        bedroomType: '1bhk',
        maxRent: 16000,
        maxCommuteMinutes: 35
      };

      const res = await request(app).post('/api/v1/recommend').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.excluded.length).toBeGreaterThan(0);

      for (const item of res.body.excluded) {
        expect(item.exclusionReasons.length).toBeGreaterThan(0);
      }
    });

    test('POST /api/v1/recommend rejects invalid requests with 400 Bad Request', async () => {
      // Missing workplace lat/lon
      const res = await request(app).post('/api/v1/recommend').send({
        city: 'bangalore',
        workplace: { name: 'Invalid Workplace' }
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid request');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Metadata Factors & Crime Exclusion Verification
  // -------------------------------------------------------------------------
  test('GET /api/v1/meta/factors discloses factor definitions and Crime & Safety exclusion', async () => {
    const res = await request(app).get('/api/v1/meta/factors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.factors)).toBe(true);
    expect(Array.isArray(res.body.excludedFactors)).toBe(true);

    const safetyExclusion = res.body.excludedFactors.find((f: any) => f.name === 'Crime & Safety');
    expect(safetyExclusion).toBeDefined();
    expect(safetyExclusion.reason).toContain('No verified, unbiased public spatial crime dataset is published');
  });
});
