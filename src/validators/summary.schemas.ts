import { z } from 'zod';

export const summaryQuerySchema = z.object({
  subjectId: z.string().min(1),
  loinc: z.string().min(1),
  window: z.coerce.number().int().positive() // months
});

export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
