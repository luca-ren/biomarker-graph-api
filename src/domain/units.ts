export type Analyte = 'glucose' | 'creatinine';

// Units supported per analyte
export const permittedUnitsByAnalyte: Record<Analyte, readonly string[]> = {
  glucose: ['mg/dL', 'mmol/L'],
  creatinine: ['mg/dL', 'umol/L']
} as const;

// Unit by default for graph if missing targetUnit
export const defaultUnitByAnalyte: Record<Analyte, string> = {
  glucose: 'mg/dL',
  creatinine: 'umol/L'
};

export function isUnitPermitted(analyte: Analyte, unit: string): boolean {
  return (permittedUnitsByAnalyte[analyte] ?? []).includes(unit);
}

// Conversions
// glucose: 1 mmol/L = 18 mg/dL
const GLUCOSE_MG_DL_PER_MMOL_L = 18;

// creatinine: 1 mg/dL = 88.4 umol/L
const CREATININE_UMOL_L_PER_MG_DL = 88.4;

export function convertValue(
  analyte: Analyte,
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (fromUnit === toUnit) return value;

  if (analyte === 'glucose') {
    if (fromUnit === 'mg/dL' && toUnit === 'mmol/L')
      return value / GLUCOSE_MG_DL_PER_MMOL_L;
    if (fromUnit === 'mmol/L' && toUnit === 'mg/dL')
      return value * GLUCOSE_MG_DL_PER_MMOL_L;
  }

  if (analyte === 'creatinine') {
    if (fromUnit === 'mg/dL' && toUnit === 'umol/L')
      return value * CREATININE_UMOL_L_PER_MG_DL;
    if (fromUnit === 'umol/L' && toUnit === 'mg/dL')
      return value / CREATININE_UMOL_L_PER_MG_DL;
  }

  throw new Error(
    `Unsupported conversion for ${analyte}: ${fromUnit} -> ${toUnit}`
  );
}
