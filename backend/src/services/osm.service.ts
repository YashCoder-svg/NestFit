import axios from 'axios';
import { config } from '../config';

export interface POICounts {
  hospitals: number;
  groceries: number;
}

class OSMService {
  private poiCache: Map<string, POICounts> = new Map();

  public async fetchPOIsAroundCentroid(lat: number, lon: number, radiusMeters: number = 1800): Promise<POICounts> {
    const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}_${radiusMeters}`;
    if (this.poiCache.has(cacheKey)) {
      return this.poiCache.get(cacheKey)!;
    }

    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
        node["shop"="supermarket"](around:${radiusMeters},${lat},${lon});
        node["shop"="convenience"](around:${radiusMeters},${lat},${lon});
        node["shop"="grocery"](around:${radiusMeters},${lat},${lon});
      );
      out body;
    `;

    let hospitals = 0;
    let groceries = 0;

    try {
      const response = await axios.post(
        config.OVERPASS_API_URL,
        `data=${encodeURIComponent(query)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 8000
        }
      );

      if (response.data && response.data.elements) {
        for (const el of response.data.elements) {
          const tags = el.tags || {};
          if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
            hospitals++;
          }
          if (tags.shop === 'supermarket' || tags.shop === 'convenience' || tags.shop === 'grocery') {
            groceries++;
          }
        }
        const counts: POICounts = { hospitals, groceries };
        this.poiCache.set(cacheKey, counts);
        return counts;
      }
    } catch {
      // Overpass busy or rate limited
    }

    return { hospitals: 0, groceries: 0 };
  }
}

export const osmService = new OSMService();
