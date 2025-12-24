import { z } from 'zod';

const sortSchema = z
  .string()
  .optional()
  .transform((v) => v ?? 'measuredAt:asc')
  .refine((v) => v === 'measuredAt:asc' || v === 'measuredAt:desc', {
    message: "sort must be 'measuredAt:asc' or 'measuredAt:desc'"
  });

export const listObservationsQuerySchema = z.object({
  subjectId: z.string().min(1).optional(),
  analyte: z.enum(['glucose', 'creatinine']).optional(),
  loinc: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: sortSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional()
});

export const observationIdParamSchema = z.object({
  id: z.string().min(1)
});

export type ListObservationsQuery = z.infer<typeof listObservationsQuerySchema>;

export type ObservationIdParams = z.infer<typeof observationIdParamSchema>;
