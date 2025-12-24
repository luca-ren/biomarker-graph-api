import 'dotenv/config';

import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { cleanDb, disconnectDb } from '../helpers/db';

import { createApp } from '../../../src/app';

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});

describe('Observations endpoint', () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it('rejects unsupported analyte on observations post', async () => {
    const res = await request(app).post('/observations').send({
      subjectId: 'subject_1',
      analyte: 'cholesterol',
      loinc: '1234-5',
      measuredAt: new Date().toISOString(),
      value: 100,
      unit: 'mg/dL'
    });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('analyte');
  });

  it('rejects unsupported unit for analyte', async () => {
    const res = await request(app).post('/observations').send({
      subjectId: 'subject_1',
      analyte: 'glucose',
      loinc: '2345-7',
      measuredAt: new Date().toISOString(),
      value: 120,
      unit: 'kg'
    });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('unit');
  });
});

it('rejects observation with measuredAt in the future', async () => {
  const future = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // +10 min

  const res = await request(app).post('/observations').send({
    subjectId: 'subject_1',
    analyte: 'glucose',
    loinc: '2345-7',
    measuredAt: future,
    value: 120,
    unit: 'mg/dL'
  });

  expect(res.status).toBe(400);
  expect(JSON.stringify(res.body)).toContain('measuredAt');
  expect(JSON.stringify(res.body)).toContain('future');
});
