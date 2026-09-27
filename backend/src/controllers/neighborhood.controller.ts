import { Request, Response } from 'express';
import { getAllNeighborhoodsData } from '../db/connection';

export async function getAllNeighborhoods(req: Request, res: Response): Promise<void> {
  try {
    const city = req.query.city as string | undefined;
    const data = await getAllNeighborhoodsData(city);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve neighborhoods', message: error.message });
  }
}

export async function getNeighborhoodByKey(req: Request, res: Response): Promise<void> {
  try {
    const key = req.params.key;
    const data = await getAllNeighborhoodsData();
    const found = data.find(n => n.key === key);

    if (!found) {
      res.status(404).json({ error: `Neighborhood '${key}' not found.` });
      return;
    }

    res.json(found);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve neighborhood detail', message: error.message });
  }
}
