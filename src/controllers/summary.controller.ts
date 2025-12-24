import type { Request, Response } from 'express';
import { summaryQuerySchema } from '../validators/summary.schemas';
import { getSummary } from '../services/sumarry.service';

export async function getSummaryHandler(req: Request, res: Response) {
  const q = summaryQuerySchema.parse(req.query);
  const result = await getSummary(q);
  res.json(result);
}
