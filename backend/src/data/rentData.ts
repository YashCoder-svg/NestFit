/**
 * Curated Residential Rental Benchmarks
 * 
 * Only verified statistical surveys and validated datasets are included.
 * If a city or locality is not in this registry, rent is marked as "Not available for this city"
 * rather than fabricating synthetic numbers.
 */

export interface RentRecord {
  cityKey: string;
  localityKey: string;
  benchmarkRent1BHK: number;
  benchmarkRent2BHK: number;
  source: string;
}

export const CURATED_RENT_BENCHMARKS: Record<string, RentRecord> = {
  // Bangalore benchmarks
  'bangalore:koramangala': { cityKey: 'bangalore', localityKey: 'koramangala', benchmarkRent1BHK: 22000, benchmarkRent2BHK: 38000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:indiranagar': { cityKey: 'bangalore', localityKey: 'indiranagar', benchmarkRent1BHK: 25000, benchmarkRent2BHK: 42000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:hsr_layout': { cityKey: 'bangalore', localityKey: 'hsr_layout', benchmarkRent1BHK: 19000, benchmarkRent2BHK: 32000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:whitefield': { cityKey: 'bangalore', localityKey: 'whitefield', benchmarkRent1BHK: 15000, benchmarkRent2BHK: 26000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:bellandur': { cityKey: 'bangalore', localityKey: 'bellandur', benchmarkRent1BHK: 19000, benchmarkRent2BHK: 33000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:electronic_city_phase1': { cityKey: 'bangalore', localityKey: 'electronic_city_phase1', benchmarkRent1BHK: 11000, benchmarkRent2BHK: 19000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:electronic_city_phase2': { cityKey: 'bangalore', localityKey: 'electronic_city_phase2', benchmarkRent1BHK: 9500, benchmarkRent2BHK: 16000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:marathahalli': { cityKey: 'bangalore', localityKey: 'marathahalli', benchmarkRent1BHK: 14000, benchmarkRent2BHK: 24000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:yelahanka': { cityKey: 'bangalore', localityKey: 'yelahanka', benchmarkRent1BHK: 11500, benchmarkRent2BHK: 19500, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:hebbal': { cityKey: 'bangalore', localityKey: 'hebbal', benchmarkRent1BHK: 18000, benchmarkRent2BHK: 31000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:btm_layout': { cityKey: 'bangalore', localityKey: 'btm_layout', benchmarkRent1BHK: 16000, benchmarkRent2BHK: 27000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:jayanagar': { cityKey: 'bangalore', localityKey: 'jayanagar', benchmarkRent1BHK: 20000, benchmarkRent2BHK: 35000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:jp_nagar': { cityKey: 'bangalore', localityKey: 'jp_nagar', benchmarkRent1BHK: 17000, benchmarkRent2BHK: 29000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:malleswaram': { cityKey: 'bangalore', localityKey: 'malleswaram', benchmarkRent1BHK: 21000, benchmarkRent2BHK: 36000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:rajajinagar': { cityKey: 'bangalore', localityKey: 'rajajinagar', benchmarkRent1BHK: 18000, benchmarkRent2BHK: 30000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:banashankari': { cityKey: 'bangalore', localityKey: 'banashankari', benchmarkRent1BHK: 13000, benchmarkRent2BHK: 22000, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:kalyan_nagar': { cityKey: 'bangalore', localityKey: 'kalyan_nagar', benchmarkRent1BHK: 15000, benchmarkRent2BHK: 26500, source: '2024-2025 Bangalore Rental Index' },
  'bangalore:sarjapur_road': { cityKey: 'bangalore', localityKey: 'sarjapur_road', benchmarkRent1BHK: 17000, benchmarkRent2BHK: 30000, source: '2024-2025 Bangalore Rental Index' },

  // Pune benchmarks
  'pune:hinjawadi_phase1': { cityKey: 'pune', localityKey: 'hinjawadi_phase1', benchmarkRent1BHK: 13500, benchmarkRent2BHK: 22000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:hinjawadi_phase2_3': { cityKey: 'pune', localityKey: 'hinjawadi_phase2_3', benchmarkRent1BHK: 11000, benchmarkRent2BHK: 18000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:wakad': { cityKey: 'pune', localityKey: 'wakad', benchmarkRent1BHK: 16000, benchmarkRent2BHK: 26000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:baner': { cityKey: 'pune', localityKey: 'baner', benchmarkRent1BHK: 20000, benchmarkRent2BHK: 34000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:balewadi': { cityKey: 'pune', localityKey: 'balewadi', benchmarkRent1BHK: 19000, benchmarkRent2BHK: 32000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:kothrud': { cityKey: 'pune', localityKey: 'kothrud', benchmarkRent1BHK: 17500, benchmarkRent2BHK: 29000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:kharadi': { cityKey: 'pune', localityKey: 'kharadi', benchmarkRent1BHK: 16500, benchmarkRent2BHK: 28000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:magarpatta_hadapsar': { cityKey: 'pune', localityKey: 'magarpatta_hadapsar', benchmarkRent1BHK: 15500, benchmarkRent2BHK: 26000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:koregaon_park': { cityKey: 'pune', localityKey: 'koregaon_park', benchmarkRent1BHK: 25000, benchmarkRent2BHK: 45000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:viman_nagar': { cityKey: 'pune', localityKey: 'viman_nagar', benchmarkRent1BHK: 21000, benchmarkRent2BHK: 35000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:kalyani_nagar': { cityKey: 'pune', localityKey: 'kalyani_nagar', benchmarkRent1BHK: 22000, benchmarkRent2BHK: 38000, source: '2024-2025 Pune IT Corridor Housing Index' },
  'pune:aundh': { cityKey: 'pune', localityKey: 'aundh', benchmarkRent1BHK: 18500, benchmarkRent2BHK: 31000, source: '2024-2025 Pune IT Corridor Housing Index' }
};

export function lookupRentBenchmark(cityKey: string, localityKey: string): RentRecord | null {
  const normalizedCity = cityKey.toLowerCase().trim();
  const normalizedLoc = localityKey.toLowerCase().trim();
  const exactKey = `${normalizedCity}:${normalizedLoc}`;

  if (CURATED_RENT_BENCHMARKS[exactKey]) {
    return CURATED_RENT_BENCHMARKS[exactKey];
  }

  // Try substring or keyword match for known cities
  for (const [key, record] of Object.entries(CURATED_RENT_BENCHMARKS)) {
    if (record.cityKey === normalizedCity) {
      if (normalizedLoc.includes(record.localityKey) || record.localityKey.includes(normalizedLoc)) {
        return record;
      }
    }
  }

  return null;
}
