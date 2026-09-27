export type CityId = string;

export interface CityInfo {
  id: CityId;
  name: string;
  state: string;
  center: [number, number]; // [lat, lon]
  defaultZoom: number;
  description: string;
  metroLines: string[];
  aqiStationsCount: number;
  isPreWarmed?: boolean;
  hasRentData?: boolean;
  hasCpcbCoverage?: boolean;
}

export interface CitySearchResult {
  id: string;
  name: string;
  state: string;
  displayName: string;
  lat: number;
  lon: number;
  boundingBox: [number, number, number, number];
  isPreWarmed: boolean;
  isCached: boolean;
}

export interface Workplace {
  city: CityId;
  key: string;
  name: string;
  zone: string;
  centroid: [number, number]; // [lon, lat]
  description?: string;
  tags?: string[];
}

export interface RadarScores {
  affordability: number;
  commuteConvenience: number;
  airQuality: number;
  healthcareAccess: number;
  dailyNeeds: number;
}

export interface DataQualityInfo {
  verifiedFactorsCount: number;
  coverageSummary: string;
  rentStatus: 'verified_benchmark' | 'unavailable';
  aqiStatus: 'measured_cpcb' | 'modeled_owm';
  amenityStatus: string;
  boundaryStatus?: 'osm_locality' | 'voronoi_grid';
  isGridFallback?: boolean;
}

export interface RankedNeighborhood {
  id: number;
  city: CityId;
  key: string;
  name: string;
  zone: string;
  description: string;
  centroid: {
    lat: number;
    lon: number;
  };
  polygon: [number, number][]; // [[lon, lat], ...]
  rent: number | null;
  rentAvailable?: boolean;
  commuteMinutes: number;
  commuteDistanceKm: number;
  aqi: number;
  aqiSource?: 'cpcb_measured' | 'owm_modeled';
  cpcbStationName?: string;
  cpcbDistanceKm?: number;
  hospitalCount: number;
  groceryCount: number;
  metroConnected: boolean;
  transitScore: number;
  isGridFallback?: boolean;
  boundarySource?: 'osm_locality' | 'voronoi_grid';
  dataQuality?: DataQualityInfo;
  tags: string[];
  rank: number;
  isParetoOptimal: boolean;
  crowdingDistance?: number;
  weightedScore?: number;
  radarScores: RadarScores;
  exclusionReasons: string[];
}

export interface RecommendationResponse {
  city: CityId;
  hasRentData?: boolean;
  rentUnavailableNotice?: string;
  isGridFallback?: boolean;
  sparseDataWarning?: boolean;
  sparseDataNotice?: string;
  paretoFrontier: RankedNeighborhood[];
  otherRanks: RankedNeighborhood[];
  excluded: RankedNeighborhood[];
  totalEvaluated: number;
  paretoOptimalCount: number;
  algorithmUsed: 'pareto' | 'weighted';
  weightsUsed?: number[];
  tradeoffAnalysis?: string;
  executionTimeMs: number;
  workplace: {
    name: string;
    lat: number;
    lon: number;
  };
  attribution: Record<string, string>;
}

export interface FilterState {
  city: CityId;
  workplace: {
    name: string;
    lat: number;
    lon: number;
  };
  transitMode: 'driving' | 'transit';
  bedroomType: '1bhk' | '2bhk';
  algorithm: 'pareto' | 'weighted';
  weights: number[]; // [w_rent, w_commute, w_aqi, w_hosp, w_groc]
  maxRent?: number;
  maxCommuteMinutes?: number;
  maxAqi?: number;
  minHospitals?: number;
  minGroceries?: number;
  paretoOnly: boolean;
}
