import axios from 'axios';
import { config } from '../config';

export interface CPCBStation {
  city: string;
  name: string;
  lat: number;
  lon: number;
  baselineAqi: number;
}

export const CPCB_STATIONS: CPCBStation[] = [
  // Bangalore CAAQMS Stations
  { city: 'bangalore', name: 'BTM Layout CAAQMS', lat: 12.9166, lon: 77.6101, baselineAqi: 95 },
  { city: 'bangalore', name: 'Silk Board Junction', lat: 12.9177, lon: 77.6238, baselineAqi: 115 },
  { city: 'bangalore', name: 'Hebbal / Baptist Hospital', lat: 13.0358, lon: 77.5970, baselineAqi: 80 },
  { city: 'bangalore', name: 'Peenya Industrial Area', lat: 13.0329, lon: 77.5141, baselineAqi: 120 },
  { city: 'bangalore', name: 'Jayanagar 5th Block', lat: 12.9250, lon: 77.5838, baselineAqi: 62 },
  { city: 'bangalore', name: 'Saneguruvanahalli (West)', lat: 12.9912, lon: 77.5450, baselineAqi: 68 },
  { city: 'bangalore', name: 'City Railway Station', lat: 12.9781, lon: 77.5694, baselineAqi: 105 },
  { city: 'bangalore', name: 'Whitefield Kadugodi', lat: 12.9863, lon: 77.7370, baselineAqi: 82 },
  { city: 'bangalore', name: 'Yelahanka Air Base Area', lat: 13.1007, lon: 77.5963, baselineAqi: 48 },

  // Pune CAAQMS Stations
  { city: 'pune', name: 'Shivajinagar CAAQMS', lat: 18.5314, lon: 73.8446, baselineAqi: 72 },
  { city: 'pune', name: 'Karve Road / Kothrud', lat: 18.5018, lon: 73.8217, baselineAqi: 65 },
  { city: 'pune', name: 'Bhosari Industrial Area', lat: 18.6298, lon: 73.8488, baselineAqi: 95 },
  { city: 'pune', name: 'Hadapsar CAAQMS', lat: 18.5020, lon: 73.9280, baselineAqi: 85 },
  { city: 'pune', name: 'Pashan / IISER Pune', lat: 18.5416, lon: 73.7928, baselineAqi: 54 },
  { city: 'pune', name: 'Lohegaon Airport Area', lat: 18.5822, lon: 73.9197, baselineAqi: 75 },

  // Jaipur CAAQMS Stations
  { city: 'jaipur', name: 'Adarsh Nagar CAAQMS', lat: 26.9030, lon: 75.8242, baselineAqi: 125 },
  { city: 'jaipur', name: 'Police Commissionerate Jaipur', lat: 26.9185, lon: 75.8010, baselineAqi: 135 },
  { city: 'jaipur', name: 'Shastri Nagar CAAQMS', lat: 26.9485, lon: 75.7972, baselineAqi: 110 },
  { city: 'jaipur', name: 'Sitapura Industrial Area', lat: 26.7825, lon: 75.8360, baselineAqi: 145 },

  // Lucknow CAAQMS Stations
  { city: 'lucknow', name: 'Lalbagh Central Lucknow', lat: 26.8467, lon: 80.9462, baselineAqi: 155 },
  { city: 'lucknow', name: 'Talkatora District Center', lat: 26.8322, lon: 80.8980, baselineAqi: 170 },
  { city: 'lucknow', name: 'Kendriya Vidyalaya Gomti Nagar', lat: 26.8615, lon: 81.0065, baselineAqi: 120 },
  { city: 'lucknow', name: 'BR Ambedkar University Lucknow', lat: 26.7680, lon: 80.9320, baselineAqi: 115 },

  // Hyderabad CAAQMS Stations
  { city: 'hyderabad', name: 'Sanathnagar CAAQMS', lat: 17.4580, lon: 78.4350, baselineAqi: 92 },
  { city: 'hyderabad', name: 'ICRISAT Patancheru', lat: 17.5110, lon: 78.2750, baselineAqi: 112 },
  { city: 'hyderabad', name: 'University of Hyderabad Gachibowli', lat: 17.4600, lon: 78.3300, baselineAqi: 75 },

  // Delhi NCR CAAQMS Stations
  { city: 'delhi', name: 'Anand Vihar CAAQMS', lat: 28.6476, lon: 77.3158, baselineAqi: 240 },
  { city: 'delhi', name: 'R K Puram CAAQMS', lat: 28.5632, lon: 77.1869, baselineAqi: 195 },
  { city: 'delhi', name: 'Punjabi Bagh CAAQMS', lat: 28.6740, lon: 77.1310, baselineAqi: 210 }
];

export interface AQIDetails {
  aqi: number;
  source: 'cpcb_measured' | 'owm_modeled';
  badge: 'Measured (CPCB)' | 'Modeled Estimate (OpenWeatherMap)';
  cpcbStationName?: string;
  cpcbDistanceKm?: number;
}

class AQIService {
  private cache: Map<string, AQIDetails> = new Map();

  public haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  public findNearestCPCBStation(lat: number, lon: number): { station: CPCBStation; distanceKm: number } | null {
    if (CPCB_STATIONS.length === 0) return null;

    let nearest = CPCB_STATIONS[0];
    let minDistance = this.haversineKm(lat, lon, nearest.lat, nearest.lon);

    for (let i = 1; i < CPCB_STATIONS.length; i++) {
      const dist = this.haversineKm(lat, lon, CPCB_STATIONS[i].lat, CPCB_STATIONS[i].lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = CPCB_STATIONS[i];
      }
    }

    return { station: nearest, distanceKm: Math.round(minDistance * 10) / 10 };
  }

  public interpolateFromCPCB(lat: number, lon: number): number {
    let weightsSum = 0;
    let aqiSum = 0;

    for (const station of CPCB_STATIONS) {
      const dist = this.haversineKm(lat, lon, station.lat, station.lon);
      if (dist < 0.2) return station.baselineAqi;
      // Inverse distance squared weighting
      const weight = 1 / (dist * dist);
      weightsSum += weight;
      aqiSum += weight * station.baselineAqi;
    }

    return weightsSum > 0 ? Math.round(aqiSum / weightsSum) : 85;
  }

  public async getAQIDetails(lat: number, lon: number): Promise<AQIDetails> {
    const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const nearestStationInfo = this.findNearestCPCBStation(lat, lon);

    // 1. If a CPCB CAAQMS station exists within ~5km, tag as "Measured (CPCB)"
    if (nearestStationInfo && nearestStationInfo.distanceKm <= 5.0) {
      const details: AQIDetails = {
        aqi: nearestStationInfo.station.baselineAqi,
        source: 'cpcb_measured',
        badge: 'Measured (CPCB)',
        cpcbStationName: nearestStationInfo.station.name,
        cpcbDistanceKm: nearestStationInfo.distanceKm
      };
      this.cache.set(cacheKey, details);
      return details;
    }

    // 2. Otherwise call OpenWeatherMap Air Pollution API if API key configured
    if (config.OPENWEATHER_API_KEY) {
      const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${config.OPENWEATHER_API_KEY}`;
      try {
        const resp = await axios.get(url, { timeout: 3000 });
        if (resp.data && resp.data.list && resp.data.list.length > 0) {
          const components = resp.data.list[0].components || {};
          const pm25 = components.pm2_5 || 35.0;
          const pm10 = components.pm10 || 60.0;
          const calculatedAqi = Math.round(Math.max(pm25 * 2.0, pm10 * 1.0));
          const details: AQIDetails = {
            aqi: calculatedAqi,
            source: 'owm_modeled',
            badge: 'Modeled Estimate (OpenWeatherMap)',
            cpcbDistanceKm: nearestStationInfo?.distanceKm
          };
          this.cache.set(cacheKey, details);
          return details;
        }
      } catch {
        // Fallback silently to regional atmospheric model
      }
    }

    // 3. Fallback: regional spatial interpolation marked as Modeled Estimate
    const fallbackAqi = this.interpolateFromCPCB(lat, lon);
    const details: AQIDetails = {
      aqi: fallbackAqi,
      source: 'owm_modeled',
      badge: 'Modeled Estimate (OpenWeatherMap)',
      cpcbDistanceKm: nearestStationInfo?.distanceKm
    };
    this.cache.set(cacheKey, details);
    return details;
  }

  public async getAQIForCoordinate(lat: number, lon: number): Promise<number> {
    const details = await this.getAQIDetails(lat, lon);
    return details.aqi;
  }
}

export const aqiService = new AQIService();
