import axios from 'axios';
import { ingestionService } from '../ingestion.service';
import { recommendationService } from '../recommendation.service';
import { rateLimiter } from '../rateLimiter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dynamic City Ingestion Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Ingestion with Mocked External APIs & Partial Data Handling', () => {
    it('successfully ingests a new uncached city and handles partial data (no CPCB station, 0 hospitals, unverified rent)', async () => {
      // 1. Mock Nominatim geocoding response
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('nominatim.openstreetmap.org/search')) {
          return Promise.resolve({
            data: [
              {
                lat: '26.9124',
                lon: '75.7873',
                display_name: 'Jaipur, Rajasthan, India',
                name: 'Jaipur',
                boundingbox: ['26.75', '27.05', '75.65', '75.95'],
                address: {
                  city: 'Jaipur',
                  state: 'Rajasthan',
                  country: 'India'
                }
              }
            ]
          });
        }
        if (url.includes('api.openweathermap.org/data/2.5/air_pollution')) {
          // Mock OWM modeled AQI response
          return Promise.resolve({
            data: {
              list: [
                {
                  main: { aqi: 3 },
                  components: { pm2_5: 58.5, pm10: 110.2 }
                }
              ]
            }
          });
        }
        return Promise.reject(new Error(`Unhandled GET url: ${url}`));
      });

      // 2. Mock Overpass queries (localities and amenities)
      mockedAxios.post.mockImplementation((url: string, data: any) => {
        const queryStr = decodeURIComponent(String(data));

        if (queryStr.includes('place=suburb') || queryStr.includes('place=neighbourhood')) {
          // Return simulated localities
          return Promise.resolve({
            data: {
              elements: [
                {
                  id: 101,
                  type: 'node',
                  lat: 26.9124,
                  lon: 75.7873,
                  tags: { name: 'C Scheme', place: 'suburb' }
                },
                {
                  id: 102,
                  type: 'node',
                  lat: 26.8500,
                  lon: 75.8000,
                  tags: { name: 'Malviya Nagar', place: 'suburb' }
                },
                {
                  id: 103,
                  type: 'node',
                  lat: 26.9500,
                  lon: 75.7200,
                  tags: { name: 'Vaishali Nagar', place: 'suburb' }
                }
              ]
            }
          });
        }

        if (queryStr.includes('amenity') || queryStr.includes('shop')) {
          // Return partial amenities: e.g. 0 hospitals, few groceries
          return Promise.resolve({
            data: {
              elements: [
                // Groceries only, ZERO hospitals to test partial data resilience
                { id: 201, type: 'node', lat: 26.9125, lon: 75.7874, tags: { shop: 'supermarket' } },
                { id: 202, type: 'node', lat: 26.8502, lon: 75.8001, tags: { shop: 'convenience' } }
              ]
            }
          });
        }

        return Promise.resolve({ data: { elements: [] } });
      });

      // Execute ingestion for Jaipur with forceRefresh = true to ensure pipeline runs
      const result = await ingestionService.ingestCity('Jaipur', true);

      expect(result).toBeDefined();
      expect(result.cityKey).toBe('jaipur');
      expect(result.name).toBe('Jaipur');
      expect(result.state).toBe('Rajasthan');
      expect(result.localityCount).toBeGreaterThanOrEqual(3);
      expect(result.cacheHit).toBe(false);

      // Verify partial data handling on localities
      for (const loc of result.localities) {
        expect(loc.city).toBe('jaipur');
        expect(loc.centroid).toHaveLength(2);
        expect(loc.polygon.length).toBeGreaterThanOrEqual(4);

        // Verify unverified rent: NestFit must not fabricate a number
        expect(loc.rentAvailable).toBe(false);
        expect(loc.benchmarkRent1BHK).toBeNull();
        expect(loc.benchmarkRent2BHK).toBeNull();
        expect(loc.dataQuality.rentStatus).toBe('unavailable');

        // Verify AQI tagging
        expect(['cpcb_measured', 'owm_modeled']).toContain(loc.aqiSource);
        expect(loc.aqiBaseline).toBeGreaterThan(0);

        // Verify 0-hospital resilience
        expect(loc.hospitalCount).toBeGreaterThanOrEqual(0);
        expect(loc.groceryCount).toBeGreaterThanOrEqual(0);
        expect(loc.dataQuality.verifiedFactorsCount).toBeGreaterThanOrEqual(3);
      }
    });

    it('feeds ingested candidate set into Pareto optimization engine without crashing on null rent', async () => {
      // Test running recommendations on the newly ingested Jaipur city
      const recResult = await recommendationService.getRecommendations({
        city: 'jaipur',
        workplace: {
          name: 'Jaipur World Trade Park',
          lat: 26.8530,
          lon: 75.8050
        },
        bedroomType: '1bhk',
        algorithm: 'pareto'
      });

      expect(recResult).toBeDefined();
      expect(recResult.city).toBe('jaipur');
      expect(recResult.hasRentData).toBe(false);
      expect(recResult.rentUnavailableNotice).toContain('Not available for this city');
      expect(recResult.paretoFrontier.length).toBeGreaterThan(0);
      expect(recResult.totalEvaluated).toBeGreaterThanOrEqual(3);

      const firstCandidate = recResult.paretoFrontier[0];
      expect(firstCandidate.rent).toBeNull();
      expect(firstCandidate.rentAvailable).toBe(false);
      expect(firstCandidate.commuteMinutes).toBeGreaterThan(0);
      expect(firstCandidate.aqi).toBeGreaterThan(0);
      expect(firstCandidate.dataQuality).toBeDefined();
      expect(firstCandidate.dataQuality.rentStatus).toBe('unavailable');
    });
  });

  describe('2. 7-Day Cache Persistence Verification', () => {
    it('returns cached data immediately on subsequent search within 7 days without hitting external APIs', async () => {
      const getCallsBefore = mockedAxios.get.mock.calls.length;
      const postCallsBefore = mockedAxios.post.mock.calls.length;

      // Ingest again with forceRefresh = false
      const cachedResult = await ingestionService.ingestCity('Jaipur', false);

      expect(cachedResult).toBeDefined();
      expect(cachedResult.cacheHit).toBe(true);
      expect(cachedResult.cityKey).toBe('jaipur');

      // Verify no additional Nominatim or Overpass calls were made
      const getCallsAfter = mockedAxios.get.mock.calls.length;
      const postCallsAfter = mockedAxios.post.mock.calls.length;

      expect(getCallsAfter).toBe(getCallsBefore);
      expect(postCallsAfter).toBe(postCallsBefore);

      // Verify expiresAt is set to ~7 days in the future
      const expiresAt = new Date(cachedResult.expiresAt).getTime();
      const ingestedAt = new Date(cachedResult.ingestedAt).getTime();
      const diffDays = (expiresAt - ingestedAt) / (1000 * 60 * 60 * 24);
      expect(Math.round(diffDays)).toBe(7);
    });

    it('identifies pre-warmed Bangalore and Pune as permanently cached for instant demo access', async () => {
      const isBangaloreCached = await ingestionService.isCityCached('bangalore');
      const isPuneCached = await ingestionService.isCityCached('pune');

      expect(isBangaloreCached).toBe(true);
      expect(isPuneCached).toBe(true);

      const blr = await ingestionService.getCachedCity('bangalore');
      expect(blr?.hasRentData).toBe(true);
      expect(blr?.hasCpcbCoverage).toBe(true);
      expect(blr?.localityCount).toBe(20);
    });
  });

  describe('3. City Search & Autocomplete', () => {
    it('searches for cities and includes cache flags', async () => {
      const results = await ingestionService.searchCities('bang');
      expect(results.length).toBeGreaterThan(0);
      const blr = results.find(r => r.id === 'bangalore');
      expect(blr).toBeDefined();
      expect(blr?.isPreWarmed).toBe(true);
      expect(blr?.isCached).toBe(true);
    });
  });
});
