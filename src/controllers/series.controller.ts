import type { Request, Response } from 'express';
import { seriesQuerySchema } from '../validators/series.schemas';
import { getSeries } from '../services/series.service';

export async function getSeriesHandler(req: Request, res: Response) {
  const q = seriesQuerySchema.parse(req.query);
  const result = await getSeries(q);
  res.json(result);
}
