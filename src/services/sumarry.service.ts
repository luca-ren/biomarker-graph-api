import type { SummaryQuery } from '../validators/summary.schemas';
import { findLastTwoInWindow } from '../repositories/sumarry.repository';
import { HttpError } from '../http/HttpError';
import {
  convertValue,
  defaultUnitByAnalyte,
  isUnitPermitted
} from '../domain/units';

function toNumberDecimal(v: unknown): number {
  const anyV: any = v;
  if (anyV && typeof anyV.toNumber === 'function') return anyV.toNumber();
  return Number(v);
}

function getTolerance(analyte: 'glucose' | 'creatinine', unit: string): number {
  // Documented simple tolerance:
  // - glucose: 2 mg/dL or 0.1 mmol/L
  // - creatinine: 0.05 mg/dL or 5 umol/L
  if (analyte === 'glucose') {
    if (unit === 'mg/dL') return 2;
    if (unit === 'mmol/L') return 0.1;
  }
  if (analyte === 'creatinine') {
    if (unit === 'mg/dL') return 0.05;
    if (unit === 'umol/L') return 5;
  }
  return 0;
}

export async function getSummary(q: SummaryQuery) {
  const rows = await findLastTwoInWindow(q);

  if (rows.length === 0) {
    throw new HttpError(
      404,
      'No observations found for subjectId/loinc in window'
    );
  }

  const analyte = rows[0]!.analyte as 'glucose' | 'creatinine';
  const unit = defaultUnitByAnalyte[analyte];

  const latest = rows[0]!;
  const latestRawUnit = latest.unitRaw;
  if (!isUnitPermitted(analyte, latestRawUnit)) {
    throw new HttpError(
      400,
      `Stored unit '${latestRawUnit}' is not permitted for analyte '${analyte}'`
    );
  }

  const latestValue = convertValue(
    analyte,
    toNumberDecimal(latest.valueRaw),
    latestRawUnit,
    unit
  );

  let trend: 'rising' | 'falling' | 'stable' = 'stable';

  if (rows.length >= 2) {
    const prev = rows[1]!;
    const prevRawUnit = prev.unitRaw;

    if (!isUnitPermitted(analyte, prevRawUnit)) {
      throw new HttpError(
        400,
        `Stored unit '${prevRawUnit}' is not permitted for analyte '${analyte}'`
      );
    }

    const prevValue = convertValue(
      analyte,
      toNumberDecimal(prev.valueRaw),
      prevRawUnit,
      unit
    );

    const delta = latestValue - prevValue;
    const tol = getTolerance(analyte, unit);

    if (delta > tol) trend = 'rising';
    else if (delta < -tol) trend = 'falling';
    else trend = 'stable';
  }

  return {
    lastValue: { value: latestValue, unit },
    lastUpdated: latest.measuredAt.toISOString(),
    trend
  };
}
