import type { ListObservationsQuery } from '../validators/observations.schemas';
import {
  findObservations,
  insertObservation
} from '../repositories/observations.repository';
import { CreateObservationBody } from '../validators/observations.create.schema';

export async function listObservations(q: ListObservationsQuery) {
  const items = await findObservations(q);

  const hasNext = items.length > q.limit;
  const data = hasNext ? items.slice(0, q.limit) : items;
  const nextCursor = hasNext ? data[data.length - 1]!.id : null;

  return { data, nextCursor };
}

export async function createObservation(body: CreateObservationBody) {
  return insertObservation(body);
}
