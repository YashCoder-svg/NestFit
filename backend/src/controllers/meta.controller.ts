import { Request, Response } from 'express';
import { getAllWorkplacesData } from '../db/connection';
import { CITIES_METADATA } from '../data/cityData';
import { ingestionService } from '../services/ingestion.service';

export async function getCities(req: Request, res: Response): Promise<void> {
  const base = Object.values(CITIES_METADATA);
  try {
    const available = await ingestionService.getAllAvailableCities();
    const result = [...base];
    for (const c of available) {
      if (!result.find(b => b.id === c.id)) {
        const cached = await ingestionService.getCachedCity(c.id);
        result.push({
          id: c.id,
          name: c.name,
          state: c.state,
          country: 'India',
          center: cached?.center || [20.5937, 78.9629],
          defaultZoom: cached?.defaultZoom || 11,
          description: cached?.description || `${c.name}, ${c.state}`,
          metroLines: cached?.metroLines || [],
          aqiStationsCount: cached?.aqiStationsCount || 1
        } as any);
      }
    }
    res.json(result);
  } catch {
    res.json(base);
  }
}

export async function getWorkplaces(req: Request, res: Response): Promise<void> {
  try {
    const city = req.query.city as string | undefined;
    const data = await getAllWorkplacesData(city);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve workplaces', message: error.message });
  }
}

export async function getFactors(req: Request, res: Response): Promise<void> {
  const cityKey = ((req.query.city as string) || 'bangalore').toLowerCase();
  const cached = await ingestionService.getCachedCity(cityKey);
  const cityMeta = CITIES_METADATA[cityKey] || (cached ? {
    id: cached.cityKey,
    name: cached.name,
    state: cached.state,
    country: cached.country,
    center: cached.center,
    defaultZoom: cached.defaultZoom,
    description: cached.description,
    metroLines: cached.metroLines,
    aqiStationsCount: cached.aqiStationsCount
  } : CITIES_METADATA['bangalore']);

  const hasRent = cached ? cached.hasRentData : ['bangalore', 'pune'].includes(cityKey);

  res.json({
    city: cityMeta.name,
    cityKey: cityMeta.id,
    cityCoordinates: { lat: cityMeta.center[0], lon: cityMeta.center[1] },
    factors: [
      {
        id: 'rent',
        name: 'Monthly Rent',
        direction: 'minimize',
        unit: '₹/month',
        description: hasRent
          ? `Median monthly rental benchmark for 1BHK / 2BHK apartments across ${cityMeta.name} micro-markets.`
          : 'Not available for this city — NestFit does not fabricate unverified rental figures.',
        source: hasRent
          ? `${cityMeta.name} Residential Market Index (Survey Benchmark)`
          : 'Not available (Unsurveyed)',
        limitation: hasRent
          ? 'Aggregated micro-market estimates; individual society amenities may vary.'
          : 'Excluded from optimization ranking; factor is not fabricated.'
      },

      {
        id: 'commute',
        name: 'Commute Duration',
        direction: 'minimize',
        unit: 'minutes',
        description: `Real road travel duration from neighborhood centroid to user-selected workplace in ${cityMeta.name}.`,
        source: `OSRM (Open Source Routing Machine) + ${cityMeta.name} peak congestion model`,
        limitation: `Reflects peak hours; public transit mode incorporates ${cityMeta.name} metro corridors and bus routes.`
      },
      {
        id: 'aqi',
        name: 'Air Quality Index (AQI)',
        direction: 'minimize',
        unit: 'AQI',
        description: 'Continuous ambient air quality index (lower value = cleaner, healthier air).',
        source: `CPCB CAAQMS monitoring network (${cityMeta.aqiStationsCount} stations) & OpenWeatherMap Air API`,
        limitation: 'Spatial interpolation from continuous ambient air stations.'
      },
      {
        id: 'hospitals',
        name: 'Healthcare Access',
        direction: 'maximize',
        unit: 'facilities',
        description: 'Count of multispecialty hospitals, clinics, and emergency healthcare centers.',
        source: 'OpenStreetMap Overpass API (amenity=hospital|clinic)',
        limitation: 'OpenStreetMap community mapped entities within boundary polygon.'
      },
      {
        id: 'groceries',
        name: 'Daily Needs & Groceries',
        direction: 'maximize',
        unit: 'retailers',
        description: 'Density of supermarkets, daily grocery stores, and hypermarkets.',
        source: 'OpenStreetMap Overpass API (shop=supermarket|convenience|grocery)',
        limitation: 'Commercial retail density.'
      }
    ],
    excludedFactors: [
      {
        id: 'crime_safety',
        name: 'Crime & Safety',
        status: 'excluded',
        reason: `Excluded — No verified, unbiased public spatial crime dataset is published at the neighborhood level for ${cityMeta.name}. To avoid generating misleading, discriminatory, or fabricated scores, this factor is strictly omitted from algorithmic scoring.`
      }
    ]
  });
}
