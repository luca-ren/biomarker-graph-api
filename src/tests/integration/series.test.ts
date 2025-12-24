import 'dotenv/config';

import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { prisma, cleanDb, disconnectDb } from '../helpers/db';

import { createApp } from '../../../src/app';

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});

describe('Series endpoint', () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('returns points sorted by measuredAt asc', async () => {
    const subjectId = 'subject_sort';
    const loinc = '2345-7';

    // insert out-of-order on purpose
    await prisma.observation.createMany({
      data: [
        {
          id: '1',
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 140,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-05-01T01:00:00.000Z')
        },
        {
          id: '2',
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 120,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-01-01T01:00:00.000Z')
        },
        {
          id: '3',
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 250,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-03-01T01:00:00.000Z')
        }
      ]
    });

    const res = await request(app)
      .get('/series')
      .query({ subjectId, loinc })
      .expect(200);

    expect(res.body.subjectId).toBe(subjectId);
    expect(res.body.loinc).toBe(loinc);
    expect(res.body.analyte).toBe('glucose');
    expect(res.body.unit).toBe('mg/dL');

    const measuredAts = res.body.points.map((p: any) => p.measuredAt);
    expect(measuredAts).toEqual([
      '2025-01-01T01:00:00.000Z',
      '2025-03-01T01:00:00.000Z',
      '2025-05-01T01:00:00.000Z'
    ]);
  });

  it('converts to targetUnit (glucose mg/dL -> mmol/L)', async () => {
    const subjectId = 'subject_convert';
    const loinc = '2345-7';

    await prisma.observation.create({
      data: {
        subjectId,
        analyte: 'glucose',
        loinc,
        valueRaw: 18,
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-01-01T01:00:00.000Z')
      }
    });

    const res = await request(app)
      .get('/series')
      .query({ subjectId, loinc, targetUnit: 'mmol/L' })
      .expect(200);

    expect(res.body.unit).toBe('mmol/L');
    expect(res.body.points).toHaveLength(1);
    expect(res.body.points[0].raw).toEqual({ value: 18, unit: 'mg/dL' });
    expect(res.body.points[0].normalized.unit).toBe('mmol/L');
    // 18 mg/dL = 1 mmol/L
    expect(res.body.points[0].normalized.value).toBeCloseTo(1, 8);
  });

  it('rejects invalid targetUnit for analyte with typed 400', async () => {
    const subjectId = 'subject_invalid_unit';
    const loinc = '2345-7';

    await prisma.observation.create({
      data: {
        subjectId,
        analyte: 'glucose',
        loinc,
        valueRaw: 120,
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-01-01T01:00:00.000Z')
      }
    });

    const res = await request(app)
      .get('/series')
      .query({ subjectId, loinc, targetUnit: 'kg' })
      .expect(400);

    expect(JSON.stringify(res.body)).toContain(
      "targetUnit 'kg' is not permitted"
    );
  });

  it('rejects mixed units within the same loinc (stored units inconsistent)', async () => {
    const subjectId = 'subject_mixed_units';
    const loinc = '2345-7';

    await prisma.observation.createMany({
      data: [
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 120,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-01-01T01:00:00.000Z')
        },
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 7,
          unitRaw: 'mmol/L',
          measuredAt: new Date('2025-02-01T01:00:00.000Z')
        }
      ]
    });

    const res = await request(app)
      .get('/series')
      .query({ subjectId, loinc })
      .expect(400);

    expect(JSON.stringify(res.body)).toContain(
      `Mixed stored units for loinc '${loinc}'`
    );
    expect(JSON.stringify(res.body)).toContain('mg/dL');
    expect(JSON.stringify(res.body)).toContain('mmol/L');
  });
});
