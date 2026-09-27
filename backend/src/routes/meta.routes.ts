import { Router } from 'express';
import { getCities, getWorkplaces, getFactors } from '../controllers/meta.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/meta/cities:
 *   get:
 *     summary: Retrieve list of supported cities (Bangalore, Pune) with coordinates and metadata
 *     tags:
 *       - Metadata
 *     responses:
 *       200:
 *         description: List of supported cities
 */
router.get('/cities', getCities);

/**
 * @openapi
 * /api/v1/meta/workplaces:
 *   get:
 *     summary: Retrieve curated IT parks and business hubs, optionally filtered by city
 *     tags:
 *       - Metadata
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *           enum: [bangalore, pune]
 *         description: Filter workplaces by city
 *     responses:
 *       200:
 *         description: List of curated tech parks
 */
router.get('/workplaces', getWorkplaces);

/**
 * @openapi
 * /api/v1/meta/factors:
 *   get:
 *     summary: Retrieve factor definitions, units, directions, and data limitations
 *     tags:
 *       - Metadata
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *           enum: [bangalore, pune]
 *         description: Get factor metadata for specific city
 *     responses:
 *       200:
 *         description: Factor definitions and exclusion documentation
 */
router.get('/factors', getFactors);

export default router;
