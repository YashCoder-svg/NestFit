import { CityId, CityInfo, CitySearchResult, FilterState, RecommendationResponse, Workplace } from '../types';

const API_BASE_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_BASE_HOST}/api/v1`;

export async function fetchCities(): Promise<CityInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/cities`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return await res.json();
  } catch (err) {
    console.warn('API cities fetch fallback:', err);
    return [
      {
        id: 'bangalore',
        name: 'Bangalore',
        state: 'Karnataka',
        center: [12.9716, 77.5946],
        defaultZoom: 11,
        description: "India's Silicon Valley — tech parks along the Outer Ring Road, vibrant cafe culture, and rapid metro expansion.",
        metroLines: ['Purple Line', 'Green Line', 'Yellow Line'],
        aqiStationsCount: 9,
        isPreWarmed: true,
        hasRentData: true
      },
      {
        id: 'pune',
        name: 'Pune',
        state: 'Maharashtra',
        center: [18.5204, 73.8567],
        defaultZoom: 11,
        description: "The Oxford of the East & major automotive/IT capital — Hinjawadi infotech cluster and Kharadi IT SEZs.",
        metroLines: ['Line 1 (Purple)', 'Line 2 (Aqua)', 'Line 3 (Hinjawadi)'],
        aqiStationsCount: 7,
        isPreWarmed: true,
        hasRentData: true
      }
    ];
  }
}

export async function searchCitiesApi(query: string): Promise<CitySearchResult[]> {
  try {
    const res = await fetch(`${API_BASE}/cities/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search cities');
    return await res.json();
  } catch (err) {
    console.warn('City search failed:', err);
    return [];
  }
}

export async function checkCityStatusApi(city: string): Promise<{
  city: string;
  isCached: boolean;
  isPreWarmed: boolean;
  localityCount: number;
  hasRentData: boolean;
  hasCpcbCoverage: boolean;
  expiresAt: string | null;
}> {
  const res = await fetch(`${API_BASE}/cities/status?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to check city status');
  return await res.json();
}

export async function ingestCityApi(cityName: string, forceRefresh: boolean = false): Promise<{
  success: boolean;
  city: any;
}> {
  const res = await fetch(`${API_BASE}/cities/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: cityName, forceRefresh })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || 'City ingestion failed');
  }
  return await res.json();
}

export async function fetchWorkplaces(city: CityId = 'bangalore'): Promise<Workplace[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/workplaces?city=${city}`);
    if (!res.ok) throw new Error('Failed to fetch workplaces');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('API workplace fetch fallback:', err);
  }

  // Fallbacks if city is pre-warmed
  if (city === 'pune') {
    return [
      { city: 'pune', key: 'hinjawadi_rgip', name: 'Rajiv Gandhi Infotech Park (Hinjawadi)', zone: 'West', centroid: [73.7179, 18.5913] },
      { city: 'pune', key: 'eon_free_zone_kharadi', name: 'EON Free Zone / WTC (Kharadi)', zone: 'East', centroid: [73.9515, 18.5516] },
      { city: 'pune', key: 'magarpatta_cybercity', name: 'Magarpatta Cybercity (Hadapsar)', zone: 'East-Central', centroid: [73.9298, 18.5147] }
    ];
  }
  if (city === 'bangalore') {
    return [
      { city: 'bangalore', key: 'ecospace_bellandur', name: 'RMZ Ecospace / Ecoworld (ORR)', zone: 'East', centroid: [77.6848, 12.9279] },
      { city: 'bangalore', key: 'manyata_tech_park', name: 'Manyata Embassy Business Park', zone: 'North', centroid: [77.6212, 13.0489] },
      { city: 'bangalore', key: 'itpl_whitefield', name: 'ITPL / International Tech Park', zone: 'East', centroid: [77.7370, 12.9863] },
      { city: 'bangalore', key: 'electronic_city_phase1', name: 'Electronic City Phase 1', zone: 'South', centroid: [77.6602, 12.8452] }
    ];
  }

  // Generic fallback for any newly ingested city
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  return [
    {
      city,
      key: `${city}_central_cbd`,
      name: `${formattedCity} Central Business District`,
      zone: 'Central Urban Core',
      centroid: [75.7873, 26.9124]
    }
  ];
}

export async function fetchFactors(city: CityId = 'bangalore'): Promise<any> {
  const res = await fetch(`${API_BASE}/meta/factors?city=${city}`);
  if (!res.ok) throw new Error('Failed to fetch factors');
  return await res.json();
}

export async function fetchRecommendations(filter: FilterState): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filter)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || 'Failed to compute recommendations');
  }
  return await res.json();
}
