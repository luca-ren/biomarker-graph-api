import type { SummaryQuery } from '../validators/summary.schemas';
import { prisma } from '../db/prisma';

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

export async function findLastTwoInWindow(q: SummaryQuery) {
  const now = new Date();
  const from = subMonths(now, q.window);

  return prisma.observation.findMany({
    where: {
      subjectId: q.subjectId,
      loinc: q.loinc,
      deletedAt: null,
      measuredAt: {
        gte: from,
        lte: now
      }
    },
    orderBy: [{ measuredAt: 'desc' }, { id: 'desc' }],
    take: 2,
    select: {
      id: true,
      analyte: true,
      measuredAt: true,
      valueRaw: true,
      unitRaw: true
    }
  });
}
