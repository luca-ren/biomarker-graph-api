import type { SeriesQuery } from '../validators/series.schemas';
import { findSeriesObservations } from '../repositories/series.repository';
import { HttpError } from '../http/HttpError';
import {
  convertValue,
  defaultUnitByAnalyte,
  isUnitPermitted
} from '../domain/units';

type SeriesPoint = {
  id: string;
  measuredAt: string; // ISO
  raw: { value: number; unit: string };
  normalized: { value: number; unit: string };
};

export async function getSeries(q: SeriesQuery) {
  const rows = await findSeriesObservations(q);

  // if no observations found
  if (rows.length === 0) {
    return {
      subjectId: q.subjectId,
      loinc: q.loinc,
      analyte: null as null | string,
      unit: q.targetUnit ?? null,
      points: [] as SeriesPoint[]
    };
  }

  const analyte = rows[0]!.analyte as 'glucose' | 'creatinine';

  const unit = q.targetUnit ?? defaultUnitByAnalyte[analyte];

  if (!isUnitPermitted(analyte, unit)) {
    throw new HttpError(
      400,
      `targetUnit '${unit}' is not permitted for analyte '${analyte}'`
    );
  }

  const points: SeriesPoint[] = rows.map((r) => {
    const rawValue =
      typeof (r.valueRaw as any).toNumber === 'function'
        ? (r.valueRaw as any).toNumber()
        : Number(r.valueRaw);

    const rawUnit = r.unitRaw;

    if (!isUnitPermitted(analyte, rawUnit)) {
      throw new HttpError(
        400,
        `Stored unit '${rawUnit}' is not permitted for analyte '${analyte}'`
      );
    }

    const normalizedValue = convertValue(analyte, rawValue, rawUnit, unit);

    return {
      id: r.id,
      measuredAt: r.measuredAt.toISOString(),
      raw: { value: rawValue, unit: rawUnit },
      normalized: { value: normalizedValue, unit }
    };
  });

  return {
    subjectId: q.subjectId,
    loinc: q.loinc,
    analyte,
    unit,
    points
  };
}
