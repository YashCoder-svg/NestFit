import { Router } from 'express';
import { recommendNeighborhoods } from '../controllers/recommendation.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/recommend:
 *   post:
 *     summary: Run multi-factor Pareto optimization or weighted scoring
 *     tags:
 *       - Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workplace
 *             properties:
 *               workplace:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   lat: { type: number }
 *                   lon: { type: number }
 *               transitMode: { type: string, enum: [driving, transit] }
 *               bedroomType: { type: string, enum: [1bhk, 2bhk] }
 *               algorithm: { type: string, enum: [pareto, weighted] }
 *               maxRent: { type: number }
 *               maxCommuteMinutes: { type: number }
 *               maxAqi: { type: number }
 *               minHospitals: { type: number }
 *               minGroceries: { type: number }
 *     responses:
 *       200:
 *         description: Pareto-optimal frontier and ranked neighborhood results
 */
router.post('/recommend', recommendNeighborhoods);

export default router;
