import { Router } from 'express';
import { getAllNeighborhoods, getNeighborhoodByKey } from '../controllers/neighborhood.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/neighborhoods:
 *   get:
 *     summary: Retrieve all Bangalore neighborhoods with GeoJSON boundaries
 *     tags:
 *       - Neighborhoods
 *     responses:
 *       200:
 *         description: List of neighborhoods with spatial polygons and baseline metrics
 */
router.get('/', getAllNeighborhoods);

/**
 * @openapi
 * /api/v1/neighborhoods/{key}:
 *   get:
 *     summary: Retrieve specific neighborhood profile by key
 *     tags:
 *       - Neighborhoods
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed neighborhood profile
 */
router.get('/:key', getNeighborhoodByKey);

export default router;
