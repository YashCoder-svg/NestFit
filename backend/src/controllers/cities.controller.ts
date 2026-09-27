import { Request, Response } from 'express';
import { ingestionService } from '../services/ingestion.service';

/**
 * Autocomplete / search Indian cities via Nominatim with rate limiting & local caching
 */
export async function searchCities(req: Request, res: Response): Promise<void> {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      const all = await ingestionService.getAllAvailableCities();
      res.json(all);
      return;
    }

    const results = await ingestionService.searchCities(query);
    res.json(results);
  } catch (error: any) {
    console.error('[CitiesController] Search error:', error);
    res.status(500).json({ error: 'City search failed', message: error.message });
  }
}

/**
 * Checks cache status of a city
 */
export async function getCityStatus(req: Request, res: Response): Promise<void> {
  try {
    const city = (req.query.city as string || '').trim().toLowerCase();
    if (!city) {
      res.status(400).json({ error: 'Query parameter "city" is required.' });
      return;
    }

    const isCached = await ingestionService.isCityCached(city);
    const cachedData = isCached ? await ingestionService.getCachedCity(city) : null;

    res.json({
      city,
      isCached,
      isPreWarmed: ['bangalore', 'pune'].includes(city),
      localityCount: cachedData?.localityCount || 0,
      hasRentData: cachedData?.hasRentData || false,
      hasCpcbCoverage: cachedData?.hasCpcbCoverage || false,
      expiresAt: cachedData?.expiresAt || null,
      ingestedAt: cachedData?.ingestedAt || null
    });
  } catch (error: any) {
    console.error('[CitiesController] Status check error:', error);
    res.status(500).json({ error: 'City status check failed', message: error.message });
  }
}

/**
 * Triggers on-demand ingestion for any Indian city
 */
export async function ingestCity(req: Request, res: Response): Promise<void> {
  try {
    const cityName = req.body?.city;
    const forceRefresh = Boolean(req.body?.forceRefresh);

    if (!cityName || typeof cityName !== 'string' || !cityName.trim()) {
      res.status(400).json({ error: 'Body field "city" is required (string).' });
      return;
    }

    console.log(`[CitiesController] Ingest request received for: "${cityName}" (forceRefresh=${forceRefresh})`);
    const result = await ingestionService.ingestCity(cityName.trim(), forceRefresh);

    res.json({
      success: true,
      city: result
    });
  } catch (error: any) {
    console.error('[CitiesController] Ingestion pipeline error:', error);
    res.status(500).json({
      error: 'Ingestion pipeline error',
      message: error.message || 'Failed to ingest city data from OpenStreetMap / AQI services'
    });
  }
}

/**
 * Returns all available cities (pre-warmed demo cities + previously ingested cities)
 */
export async function getAvailableCities(req: Request, res: Response): Promise<void> {
  try {
    const cities = await ingestionService.getAllAvailableCities();
    res.json(cities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve available cities', message: error.message });
  }
}
