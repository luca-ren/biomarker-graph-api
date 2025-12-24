import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { CreateObservationBody } from '../validators/observations.create.schema';
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

export async function insertObservation(body: CreateObservationBody) {
  return prisma.observation.create({
    data: {
      subjectId: body.subjectId,
      analyte: body.analyte,
      loinc: body.loinc,
      valueRaw: new Prisma.Decimal(body.value),
      unitRaw: body.unit,
      measuredAt: body.measuredAt,
      rawPayload: body.rawPayload as Prisma.InputJsonValue
    }
  });
}
