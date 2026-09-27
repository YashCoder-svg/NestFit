import { Router } from 'express';
import { searchCities, getCityStatus, ingestCity, getAvailableCities } from '../controllers/cities.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/cities/search:
 *   get:
 *     summary: Search and autocomplete Indian cities via Nominatim with rate limiting
 *     tags:
 *       - Dynamic Cities
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: City name or prefix to search (e.g. "Jaipur", "Lucknow")
 *     responses:
 *       200:
 *         description: Matching Indian cities with bounding boxes and cache status
 */
router.get('/search', searchCities);

/**
 * @openapi
 * /api/v1/cities/status:
 *   get:
 *     summary: Check 7-day cache status of a city
 *     tags:
 *       - Dynamic Cities
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Cache status and coverage details
 */
router.get('/status', getCityStatus);

/**
 * @openapi
 * /api/v1/cities/ingest:
 *   post:
 *     summary: On-demand ingestion pipeline for any Indian city
 *     tags:
 *       - Dynamic Cities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *             properties:
 *               city:
 *                 type: string
 *                 example: Jaipur
 *               forceRefresh:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Ingested city micro-markets, bounds, AQI baselines, and POI counts
 */
router.post('/ingest', ingestCity);

/**
 * @openapi
 * /api/v1/cities:
 *   get:
 *     summary: List all currently available cities in cache and seed
 *     tags:
 *       - Dynamic Cities
 *     responses:
 *       200:
 *         description: List of available cities
 */
router.get('/', getAvailableCities);

export default router;
