import type { Request, Response } from 'express';
import { listObservationsQuerySchema } from '../validators/observations.schemas';
import { listObservations } from '../services/observations.service';
import { createObservationBodySchema } from '../validators/observations.create.schema';
import { createObservation } from '../services/observations.service';

export async function listObservationsHandler(req: Request, res: Response) {
  const q = listObservationsQuerySchema.parse(req.query);
  const result = await listObservations(q);
  res.json(result);
}

export async function createObservationHandler(req: Request, res: Response) {
  const body = createObservationBodySchema.parse(req.body);
  const created = await createObservation(body);
  res.status(201).json(created);
}
