import { z } from 'zod';

export const seriesQuerySchema = z.object({
  subjectId: z.string().min(1),
  loinc: z.string().min(1),
  targetUnit: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

export type SeriesQuery = z.infer<typeof seriesQuerySchema>;
