import { getAllNeighborhoodsData } from '../db/connection';
import { osrmService } from './osrm.service';
import { aqiService } from './aqi.service';
import { ingestionService } from './ingestion.service';
import { rankByPareto } from '../engine/pareto';
import { rankByWeightedScore } from '../engine/weighted';
import { Candidate, ObjectiveDirection } from '../engine/types';

export interface RecommendationRequest {
  city?: string;
  workplace: {
    name: string;
    lat: number;
    lon: number;
  };
  transitMode?: 'driving' | 'transit';
  bedroomType?: '1bhk' | '2bhk';
  algorithm?: 'pareto' | 'weighted';
  weights?: number[]; // [w_rent, w_commute, w_aqi, w_hospitals, w_groceries]
  maxRent?: number;
  maxCommuteMinutes?: number;
  maxAqi?: number;
  minHospitals?: number;
  minGroceries?: number;
  paretoOnly?: boolean;
}

export interface RecommendationResult {
  city: string;
  hasRentData: boolean;
  rentUnavailableNotice?: string;
  isGridFallback?: boolean;
  sparseDataWarning?: boolean;
  sparseDataNotice?: string;
  paretoFrontier: any[];
  otherRanks: any[];
  excluded: any[];
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

export class RecommendationService {
  private static computeRadarScores(
    rent: number | null,
    commute: number,
    aqi: number,
    hospitals: number,
    groceries: number,
    stats: {
      rent: { min: number; max: number };
      commute: { min: number; max: number };
      aqi: { min: number; max: number };
      hospitals: { min: number; max: number };
      groceries: { min: number; max: number };
    }
  ) {
    const scale = (val: number, minV: number, maxV: number, invert: boolean = false) => {
      if (maxV <= minV) return 50.0;
      let norm = (val - minV) / (maxV - minV);
      norm = Math.max(0.0, Math.min(1.0, norm));
      if (invert) norm = 1.0 - norm;
      return Math.round(norm * 1000) / 10;
    };

    return {
      affordability: rent !== null ? scale(rent, stats.rent.min, stats.rent.max, true) : 50.0,
      commuteConvenience: scale(commute, stats.commute.min, stats.commute.max, true),
      airQuality: scale(aqi, stats.aqi.min, stats.aqi.max, true),
      healthcareAccess: scale(hospitals, stats.hospitals.min, stats.hospitals.max, false),
      dailyNeeds: scale(groceries, stats.groceries.min, stats.groceries.max, false)
    };
  }

  public async getRecommendations(req: RecommendationRequest): Promise<RecommendationResult> {
    const startTime = performance.now();
    const city = (req.city || 'bangalore').toLowerCase();

    let neighborhoods = await getAllNeighborhoodsData(city);
    if (!neighborhoods || neighborhoods.length === 0) {
      // Auto-ingest uncached city
      const ingested = await ingestionService.ingestCity(city);
      neighborhoods = ingested.localities as any;
    }

    const mode = req.transitMode || 'driving';
    const is2BHK = req.bedroomType === '2bhk';
    const algorithm = req.algorithm || 'pareto';

    const destLat = req.workplace.lat;
    const destLon = req.workplace.lon;

    // Parallel calculations for commute times and AQIs
    const commutePromises = neighborhoods.map(n =>
      osrmService.getCommuteTime(
        n.centroid[1], // lat
        n.centroid[0], // lon
        destLat,
        destLon,
        mode,
        n.metroConnected
      )
    );

    const aqiPromises = neighborhoods.map(n =>
      aqiService.getAQIForCoordinate(n.centroid[1], n.centroid[0])
    );

    const commuteResults = await Promise.all(commutePromises);
    const aqiResults = await Promise.all(aqiPromises);

    // Check if rent is available for this city/dataset
    const validRents: number[] = [];
    neighborhoods.forEach(n => {
      const r = is2BHK ? n.benchmarkRent2BHK : n.benchmarkRent1BHK;
      if (typeof r === 'number' && !isNaN(r)) {
        validRents.push(r);
      }
    });

    const hasRentData = validRents.length > 0;

    const rents: (number | null)[] = [];
    const commutes: number[] = [];
    const aqis: number[] = [];
    const hospitals: number[] = [];
    const groceries: number[] = [];

    const eligibleCandidates: Candidate[] = [];
    const excludedCandidates: any[] = [];

    // Evaluate constraints and construct candidate objects
    neighborhoods.forEach((n, idx) => {
      const rawRent = is2BHK ? n.benchmarkRent2BHK : n.benchmarkRent1BHK;
      const rent = typeof rawRent === 'number' && !isNaN(rawRent) ? rawRent : null;

      const commute = commuteResults[idx];
      const commuteMins = commute.durationMinutes;
      const commuteKm = commute.distanceKm;
      const aqiVal = aqiResults[idx];
      const hospCount = n.hospitalCount;
      const grocCount = n.groceryCount;

      rents.push(rent);
      commutes.push(commuteMins);
      aqis.push(aqiVal);
      hospitals.push(hospCount);
      groceries.push(grocCount);

      const exclusionReasons: string[] = [];
      if (req.maxRent !== undefined && rent !== null && rent > req.maxRent) {
        exclusionReasons.push(`Rent ₹${rent.toLocaleString('en-IN')} exceeds maximum budget of ₹${req.maxRent.toLocaleString('en-IN')}`);
      }
      if (req.maxCommuteMinutes !== undefined && commuteMins > req.maxCommuteMinutes) {
        exclusionReasons.push(`Commute time (${commuteMins} mins) exceeds maximum threshold of ${req.maxCommuteMinutes} mins`);
      }
      if (req.maxAqi !== undefined && aqiVal > req.maxAqi) {
        exclusionReasons.push(`AQI (${aqiVal}) exceeds acceptable air quality limit of ${req.maxAqi}`);
      }
      if (req.minHospitals !== undefined && hospCount < req.minHospitals) {
        exclusionReasons.push(`Healthcare facilities (${hospCount}) below requested minimum of ${req.minHospitals}`);
      }
      if (req.minGroceries !== undefined && grocCount < req.minGroceries) {
        exclusionReasons.push(`Daily needs & grocery stores (${grocCount}) below requested minimum of ${req.minGroceries}`);
      }

      const rentAvailable = (n as any).rentAvailable ?? (rent !== null);
      const aqiSource = (n as any).aqiSource || 'cpcb_measured';
      const cpcbStationName = (n as any).cpcbStationName;
      const cpcbDistanceKm = (n as any).cpcbDistanceKm;

      const verifiedCount = (rentAvailable ? 1 : 0) + (aqiSource === 'cpcb_measured' ? 1 : 0) + 3;

      const dataQuality = (n as any).dataQuality || {
        verifiedFactorsCount: verifiedCount,
        coverageSummary: rentAvailable ? `${verifiedCount}/5 Verified Factors` : `${verifiedCount}/5 Factors (Rent Unverified)`,
        rentStatus: rentAvailable ? 'verified_benchmark' : 'unavailable',
        aqiStatus: aqiSource === 'cpcb_measured' ? 'measured_cpcb' : 'modeled_owm',
        amenityStatus: 'osm_live'
      };

      const isGridFallback = (n as any).isGridFallback || (n as any).boundarySource === 'voronoi_grid' || false;
      const boundarySource = (n as any).boundarySource || (isGridFallback ? 'voronoi_grid' : 'osm_locality');

      const baseArea = {
        id: idx + 1,
        city: n.city,
        key: n.key,
        name: n.name,
        zone: n.zone,
        description: n.description,
        centroid: { lat: n.centroid[1], lon: n.centroid[0] },
        polygon: n.polygon,
        rent,
        rentAvailable,
        commuteMinutes: commuteMins,
        commuteDistanceKm: commuteKm,
        aqi: aqiVal,
        aqiSource,
        cpcbStationName,
        cpcbDistanceKm,
        hospitalCount: hospCount,
        groceryCount: grocCount,
        metroConnected: n.metroConnected,
        transitScore: n.transitScore,
        isGridFallback,
        boundarySource,
        dataQuality: {
          ...dataQuality,
          boundaryStatus: boundarySource,
          isGridFallback
        },
        tags: n.tags,
        exclusionReasons
      };

      if (exclusionReasons.length > 0) {
        excludedCandidates.push(baseArea);
      } else {
        // If rent is available, 5D vector; if rent unverified, 4D vector
        const objectives = hasRentData && rent !== null
          ? [rent, commuteMins, aqiVal, hospCount, grocCount]
          : [commuteMins, aqiVal, hospCount, grocCount];

        eligibleCandidates.push({
          ...baseArea,
          objectives
        });
      }
    });

    const cityStats = {
      rent: {
        min: validRents.length > 0 ? Math.min(...validRents) : 10000,
        max: validRents.length > 0 ? Math.max(...validRents) : 40000
      },
      commute: { min: Math.min(...commutes), max: Math.max(...commutes) },
      aqi: { min: Math.min(...aqis), max: Math.max(...aqis) },
      hospitals: { min: Math.min(...hospitals), max: Math.max(...hospitals) },
      groceries: { min: Math.min(...groceries), max: Math.max(...groceries) }
    };

    const directions: ObjectiveDirection[] = hasRentData
      ? ['MINIMIZE', 'MINIMIZE', 'MINIMIZE', 'MAXIMIZE', 'MAXIMIZE']
      : ['MINIMIZE', 'MINIMIZE', 'MAXIMIZE', 'MAXIMIZE'];

    let effectiveWeights = req.weights;
    if (!hasRentData && req.weights && req.weights.length === 5) {
      // Slice off rent weight [w_rent, w_commute, w_aqi, w_hospitals, w_groceries] -> [w_commute, w_aqi, w_hospitals, w_groceries]
      effectiveWeights = req.weights.slice(1);
    }

    let paretoFrontier: any[] = [];
    let otherRanks: any[] = [];
    let tradeoffAnalysis: string | undefined;
    let weightsUsed: number[] | undefined;

    if (algorithm === 'weighted') {
      const weightedResult = rankByWeightedScore(eligibleCandidates, directions, effectiveWeights);
      tradeoffAnalysis = weightedResult.tradeoffAnalysis;
      weightsUsed = weightedResult.weightsUsed;

      paretoFrontier = weightedResult.ranked.slice(0, 5).map(item => ({
        ...item,
        rank: item.rank,
        isParetoOptimal: false,
        radarScores: RecommendationService.computeRadarScores(
          item.rent,
          item.commuteMinutes,
          item.aqi,
          item.hospitalCount,
          item.groceryCount,
          cityStats
        )
      }));

      otherRanks = weightedResult.ranked.slice(5).map(item => ({
        ...item,
        rank: item.rank,
        isParetoOptimal: false,
        radarScores: RecommendationService.computeRadarScores(
          item.rent,
          item.commuteMinutes,
          item.aqi,
          item.hospitalCount,
          item.groceryCount,
          cityStats
        )
      }));
    } else {
      const paretoResult = rankByPareto(eligibleCandidates, directions);

      paretoFrontier = paretoResult.paretoFrontier.map(item => ({
        ...item,
        rank: 1,
        isParetoOptimal: true,
        radarScores: RecommendationService.computeRadarScores(
          item.rent,
          item.commuteMinutes,
          item.aqi,
          item.hospitalCount,
          item.groceryCount,
          cityStats
        )
      }));

      otherRanks = (req.paretoOnly ? [] : paretoResult.dominated).map(item => ({
        ...item,
        rank: item.rank,
        isParetoOptimal: false,
        radarScores: RecommendationService.computeRadarScores(
          item.rent,
          item.commuteMinutes,
          item.aqi,
          item.hospitalCount,
          item.groceryCount,
          cityStats
        )
      }));
    }

    const formattedExcluded = excludedCandidates.map(item => ({
      ...item,
      rank: 999,
      isParetoOptimal: false,
      radarScores: RecommendationService.computeRadarScores(
        item.rent,
        item.commuteMinutes,
        item.aqi,
        item.hospitalCount,
        item.groceryCount,
        cityStats
      )
    }));

    const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
    const hasAnyGridFallback = neighborhoods.some(n => (n as any).isGridFallback || (n as any).boundarySource === 'voronoi_grid');
    const isSparseData = paretoFrontier.length <= 2 || hasAnyGridFallback;
    const sparseDataNotice = isSparseData
      ? 'Limited distinct areas detected for this city — results may be less differentiated than metro areas with denser data.'
      : undefined;

    return {
      city,
      hasRentData,
      rentUnavailableNotice: hasRentData
        ? undefined
        : 'Not available for this city — NestFit does not fabricate unverified rental figures',
      isGridFallback: hasAnyGridFallback,
      sparseDataWarning: isSparseData,
      sparseDataNotice,
      paretoFrontier,
      otherRanks,
      excluded: formattedExcluded,
      totalEvaluated: neighborhoods.length,
      paretoOptimalCount: paretoFrontier.length,
      algorithmUsed: algorithm,
      weightsUsed,
      tradeoffAnalysis,
      executionTimeMs: durationMs,
      workplace: req.workplace,
      attribution: {
        routing: `OSRM with ${city.toUpperCase()} peak transit calibration`,
        pois: 'OpenStreetMap Overpass API (hospitals, clinics, supermarkets, groceries)',
        aqi: 'Central Pollution Control Board (CPCB) CAAQMS network + OpenWeatherMap Air API',
        rent: hasRentData
          ? `${city.toUpperCase()} Residential Rental Benchmark Index (Curated Survey)`
          : 'Not available for this city — NestFit does not fabricate unverified rental figures',
        safetyNote: `Excluded — No verified public spatial crime dataset available for ${city}`
      }
    };
  }
}

export const recommendationService = new RecommendationService();
