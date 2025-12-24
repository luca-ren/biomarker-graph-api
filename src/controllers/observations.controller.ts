import type { Request, Response } from 'express';
import { listObservationsQuerySchema } from '../validators/observations.schemas';
import { listObservations } from '../services/observations.service';

export async function listObservationsHandler(req: Request, res: Response) {
  const q = listObservationsQuerySchema.parse(req.query);
  const result = await listObservations(q);
  res.json(result);
}
