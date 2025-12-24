import { prisma } from '../db/prisma';
import type { SeriesQuery } from '../validators/series.schemas';

export async function findSeriesObservations(q: SeriesQuery) {
  return prisma.observation.findMany({
    where: {
      subjectId: q.subjectId,
      loinc: q.loinc,
      deletedAt: null,
      ...(q.from || q.to
        ? {
            measuredAt: {
              ...(q.from ? { gte: q.from } : {}),
              ...(q.to ? { lte: q.to } : {})
            }
          }
        : {})
    },
    orderBy: [{ measuredAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      analyte: true,
      loinc: true,
      measuredAt: true,
      valueRaw: true,
      unitRaw: true,
      rawPayload: true
    }
  });
}
