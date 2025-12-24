import { describe, it, expect } from 'vitest';
import { convertValue } from '../../../src/domain/units'; // <-- ajuste le chemin

describe('Unit Conversion', () => {
  it('converts glucose from mg/dL to mmol/L correctly', () => {
    // 18 mg/dL = 1 mmol/L
    const result = convertValue('glucose', 18, 'mg/dL', 'mmol/L');
    expect(result).toBeCloseTo(1, 8);
  });

  it('rejects invalid unit conversion for analyte', () => {
    expect(() => convertValue('glucose', 10, 'mg/dL', 'umol/L')).toThrowError(
      'Unsupported conversion'
    );
  });
});
