import { prisma } from '../db/prisma';
import type { ListObservationsQuery } from '../validators/observations.schemas';

export async function findObservations(q: ListObservationsQuery) {
  const [, direction] = (q.sort ?? 'measuredAt:desc').split(':') as [
    'measuredAt',
    'asc' | 'desc'
  ];
  const measuredAtOrder = direction;

  return prisma.observation.findMany({
    where: {
      deletedAt: null,
      ...(q.subjectId ? { subjectId: q.subjectId } : {}),
      ...(q.analyte ? { analyte: q.analyte } : {}),
      ...(q.loinc ? { loinc: q.loinc } : {}),
      ...(q.from || q.to
        ? {
            measuredAt: {
              ...(q.from ? { gte: q.from } : {}),
              ...(q.to ? { lte: q.to } : {})
            }
          }
        : {})
    },
    orderBy: [{ measuredAt: measuredAtOrder }, { id: 'desc' }],
    take: q.limit + 1,
    ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {})
  });
}
