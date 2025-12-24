import { z } from 'zod';

const analyteSchema = z.enum(['glucose', 'creatinine']);

const permittedUnitsByAnalyte: Record<
  z.infer<typeof analyteSchema>,
  readonly string[]
> = {
  glucose: ['mg/dL', 'mmol/L'],
  creatinine: ['mg/dL', 'umol/L']
} as const;

export const createObservationBodySchema = z
  .object({
    subjectId: z.string().min(1),
    analyte: analyteSchema,
    loinc: z.string().min(1).optional(),

    value: z
      .union([z.number(), z.string()])
      .transform((v) => (typeof v === 'string' ? Number(v) : v)),
    unit: z.string().min(1),

    // ISO 8601 -> Date
    measuredAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),

    rawPayload: z.unknown().optional()
  })
  .superRefine((val, ctx) => {
    // value numeric
    if (!Number.isFinite(val.value)) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'value must be a finite number'
      });
    }

    // measuredAt not in future (tolerance 2 min)
    const now = Date.now();
    const t = val.measuredAt.getTime();
    if (t > now + 2 * 60 * 1000) {
      ctx.addIssue({
        code: 'custom',
        path: ['measuredAt'],
        message: 'measuredAt must not be in the future'
      });
    }

    // unit permitted for analyte
    const allowed = permittedUnitsByAnalyte[val.analyte] ?? [];
    if (!allowed.includes(val.unit)) {
      ctx.addIssue({
        code: 'custom',
        path: ['unit'],
        message: `unit '${val.unit}' is not permitted for analyte '${
          val.analyte
        }'. Allowed: ${allowed.join(', ')}`
      });
    }
  });

export type CreateObservationBody = z.infer<typeof createObservationBodySchema>;
