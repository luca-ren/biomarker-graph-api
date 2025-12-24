import type { ListObservationsQuery } from '../validators/observations.schemas';
import { findObservations } from '../repositories/observations.repository';

export async function listObservations(q: ListObservationsQuery) {
  const items = await findObservations(q);

  const hasNext = items.length > q.limit;
  const data = hasNext ? items.slice(0, q.limit) : items;
  const nextCursor = hasNext ? data[data.length - 1]!.id : null;

  return { data, nextCursor };
}
