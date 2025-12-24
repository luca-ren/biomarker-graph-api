import type { ListObservationsQuery } from '../validators/observations.schemas';
import {
  findObservationById,
  findObservations,
  insertObservation
} from '../repositories/observations.repository';
import { CreateObservationBody } from '../validators/observations.create.schema';
import { HttpError } from '../http/HttpError';

export async function listObservations(q: ListObservationsQuery) {
  const items = await findObservations(q);

  const hasNext = items.length > q.limit;
  const data = hasNext ? items.slice(0, q.limit) : items;
  const nextCursor = hasNext ? data[data.length - 1]!.id : null;

  return { data, nextCursor };
}

export async function getObservationById(id: string) {
  const obs = await findObservationById(id);
  if (!obs) throw new HttpError(404, 'Observation not found');
  return obs;
}

export async function createObservation(body: CreateObservationBody) {
  return insertObservation(body);
}
