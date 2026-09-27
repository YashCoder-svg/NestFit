import axios from 'axios';
import { config } from '../config';

export interface CommuteEstimate {
  durationMinutes: number;
  distanceKm: number;
  source: 'osrm_real_road_network' | 'bangalore_traffic_heuristic_model';
}

class OSRMService {
  private cache: Map<string, CommuteEstimate> = new Map();

  public static haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public estimateFallback(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    mode: 'driving' | 'transit',
    metroConnected: boolean = false
  ): CommuteEstimate {
    const crowFliesKm = OSRMService.haversineDistanceKm(originLat, originLon, destLat, destLon);
    const roadKm = Math.round(crowFliesKm * 1.42 * 10) / 10; // Bangalore urban road winding factor

    let durationMins: number;
    if (mode === 'transit') {
      if (metroConnected && roadKm > 5.0) {
        // Metro rapid transit: avg 32 km/h + 8 min walk/transfer
        durationMins = Math.round((roadKm / 32.0) * 60 + 8.0);
      } else {
        // BMTC bus network: avg 15 km/h + 7 min wait/walk
        durationMins = Math.round((roadKm / 15.0) * 60 + 7.0);
      }
    } else {
      // Driving / Cab in Bangalore traffic: avg 19.5 km/h
      durationMins = Math.round((roadKm / 19.5) * 60 + 3.0);
    }

    return {
      durationMinutes: Math.max(5, durationMins),
      distanceKm: Math.max(0.5, roadKm),
      source: 'bangalore_traffic_heuristic_model'
    };
  }

  public async getCommuteTime(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    mode: 'driving' | 'transit' = 'driving',
    metroConnected: boolean = false
  ): Promise<CommuteEstimate> {
    const cacheKey = `${originLat.toFixed(3)}_${originLon.toFixed(3)}_${destLat.toFixed(3)}_${destLon.toFixed(3)}_${mode}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const url = `${config.OSRM_BASE_URL}/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;

    try {
      const response = await axios.get(url, { timeout: 3000 });
      if (response.data && response.data.code === 'Ok' && response.data.routes?.length > 0) {
        const route = response.data.routes[0];
        const distanceKm = Math.round((route.distance / 1000.0) * 10) / 10;
        const rawMins = (route.duration / 60.0) * 1.45; // Bangalore peak hour multiplier

        let durationMins: number;
        if (mode === 'transit') {
          if (metroConnected && distanceKm > 5.0) {
            durationMins = Math.round(rawMins * 0.85 + 6.0);
          } else {
            durationMins = Math.round(rawMins * 1.35 + 8.0);
          }
        } else {
          durationMins = Math.round(rawMins);
        }

        const result: CommuteEstimate = {
          durationMinutes: Math.max(5, durationMins),
          distanceKm: Math.max(0.5, distanceKm),
          source: 'osrm_real_road_network'
        };
        this.cache.set(cacheKey, result);
        return result;
      }
    } catch {
      // Fallback silently to calibrated Bangalore traffic model
    }

    const fallback = this.estimateFallback(originLat, originLon, destLat, destLon, mode, metroConnected);
    this.cache.set(cacheKey, fallback);
    return fallback;
  }
}

export const osrmService = new OSRMService();
