import { Request, Response } from 'express';
import { recommendationService, RecommendationRequest } from '../services/recommendation.service';

export async function recommendNeighborhoods(req: Request, res: Response): Promise<void> {
  try {
    const body: RecommendationRequest = req.body;

    if (!body.workplace || typeof body.workplace.lat !== 'number' || typeof body.workplace.lon !== 'number') {
      res.status(400).json({
        error: 'Invalid request: workplace with lat and lon coordinates is required.'
      });
      return;
    }

    const result = await recommendationService.getRecommendations(body);
    res.json(result);
  } catch (error: any) {
    console.error('[RecommendationController] Error:', error);
    res.status(500).json({ error: 'Internal optimization engine error', message: error.message });
  }
}
