import mongoose from 'mongoose';
import { config } from '../config';
import { Neighborhood } from './models/Neighborhood';
import { Workplace } from './models/Workplace';
import { ALL_NEIGHBORHOODS, ALL_WORKPLACES } from '../data/cityData';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if empty
    await autoSeedIfEmpty();
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection not available (${error.message}). Running with embedded multi-city data store.`);
    isConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export async function autoSeedIfEmpty() {
  if (!isConnected) return;

  try {
    const count = await Neighborhood.countDocuments();
    if (count === 0) {
      console.log(`[Database] Populating MongoDB with ${ALL_NEIGHBORHOODS.length} neighborhoods (Bangalore & Pune)...`);
      for (const n of ALL_NEIGHBORHOODS) {
        await Neighborhood.create({
          city: n.city,
          key: n.key,
          name: n.name,
          zone: n.zone,
          description: n.description,
          location: {
            type: 'Point',
            coordinates: n.centroid
          },
          geometry: {
            type: 'Polygon',
            coordinates: [n.polygon]
          },
          benchmarkRent1BHK: n.benchmarkRent1BHK,
          benchmarkRent2BHK: n.benchmarkRent2BHK,
          aqiBaseline: n.aqiBaseline,
          hospitalCount: n.hospitalCount,
          groceryCount: n.groceryCount,
          metroConnected: n.metroConnected,
          transitScore: n.transitScore,
          tags: n.tags
        });
      }
      console.log(`[Database] Neighborhoods seeded successfully.`);
    }

    const workplaceCount = await Workplace.countDocuments();
    if (workplaceCount === 0) {
      console.log(`[Database] Populating MongoDB with ${ALL_WORKPLACES.length} tech parks (Bangalore & Pune)...`);
      for (const wp of ALL_WORKPLACES) {
        await Workplace.create({
          city: wp.city,
          key: wp.key,
          name: wp.name,
          zone: wp.zone,
          location: {
            type: 'Point',
            coordinates: wp.centroid
          },
          description: wp.description,
          tags: wp.tags
        });
      }
      console.log(`[Database] Tech parks seeded successfully.`);
    }
  } catch (err: any) {
    console.error(`[Database] Auto-seed error: ${err.message}`);
  }
}

type LocalityProvider = (city: string) => Promise<any[] | null>;
type WorkplaceProvider = (city: string) => Promise<any[] | null>;

let dynamicLocalityProvider: LocalityProvider | null = null;
let dynamicWorkplaceProvider: WorkplaceProvider | null = null;

export function registerDynamicLocalityProvider(provider: LocalityProvider) {
  dynamicLocalityProvider = provider;
}

export function registerDynamicWorkplaceProvider(provider: WorkplaceProvider) {
  dynamicWorkplaceProvider = provider;
}

/**
 * Returns all neighborhoods, optionally filtered by city ('bangalore' | 'pune' | any ingested city).
 */
export async function getAllNeighborhoodsData(city?: string) {
  const normalizedCity = city?.toLowerCase();

  if (isConnected) {
    try {
      const query = normalizedCity ? { city: normalizedCity } : {};
      const docs = await Neighborhood.find(query).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({
          city: d.city,
          key: d.key,
          name: d.name,
          zone: d.zone,
          description: d.description,
          centroid: d.location.coordinates,
          polygon: d.geometry.coordinates[0],
          benchmarkRent1BHK: d.benchmarkRent1BHK,
          benchmarkRent2BHK: d.benchmarkRent2BHK,
          rentAvailable: d.rentAvailable,
          aqiBaseline: d.aqiBaseline,
          aqiSource: d.aqiSource,
          cpcbStationName: d.cpcbStationName,
          cpcbDistanceKm: d.cpcbDistanceKm,
          hospitalCount: d.hospitalCount,
          groceryCount: d.groceryCount,
          metroConnected: d.metroConnected,
          transitScore: d.transitScore,
          isGridFallback: (d as any).isGridFallback || false,
          boundarySource: (d as any).boundarySource || 'osm_locality',
          dataQuality: d.dataQuality,
          tags: d.tags

        }));
      }
    } catch (e: any) {
      console.warn(`[Database] MongoDB query error: ${e.message}, falling back to memory store.`);
    }
  }

  // Fallback to high-fidelity embedded dataset
  if (normalizedCity) {
    const staticHoods = ALL_NEIGHBORHOODS.filter(n => n.city === normalizedCity);
    if (staticHoods.length > 0) return staticHoods;
    if (dynamicLocalityProvider) {
      const dynamicHoods = await dynamicLocalityProvider(normalizedCity);
      if (dynamicHoods && dynamicHoods.length > 0) return dynamicHoods;
    }
    return [];
  }
  return ALL_NEIGHBORHOODS;
}

/**
 * Returns workplaces, optionally filtered by city ('bangalore' | 'pune' | any ingested city).
 */
export async function getAllWorkplacesData(city?: string) {
  const normalizedCity = city?.toLowerCase();

  if (isConnected) {
    try {
      const query = normalizedCity ? { city: normalizedCity } : {};
      const docs = await Workplace.find(query).lean();
      if (docs && docs.length > 0) {
        return docs.map(w => ({
          city: w.city,
          key: w.key,
          name: w.name,
          zone: w.zone,
          centroid: w.location.coordinates,
          description: w.description,
          tags: w.tags
        }));
      }
    } catch (e: any) {
      console.warn(`[Database] Workplace query fallback: ${e.message}`);
    }
  }

  if (normalizedCity) {
    const staticWps = ALL_WORKPLACES.filter(w => w.city === normalizedCity);
    if (staticWps.length > 0) return staticWps;
    if (dynamicWorkplaceProvider) {
      const dynamicWps = await dynamicWorkplaceProvider(normalizedCity);
      if (dynamicWps && dynamicWps.length > 0) return dynamicWps;
    }
    return [];
  }
  return ALL_WORKPLACES;
}

