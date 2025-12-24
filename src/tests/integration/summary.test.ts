import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  beforeAll,
  vi,
  afterEach
} from 'vitest';
import request from 'supertest';
import { prisma, cleanDb, disconnectDb } from '../helpers/db';
import { createApp } from '../../../src/app';

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  app = createApp();
});

afterAll(async () => {
  vi.useRealTimers();
});

describe('Summary endpoint', () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterEach(async () => {
    vi.useRealTimers(); // reset timers after every test
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('returns trend rising when last two normalized points increase (within window months)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00.000Z'));
    const subjectId = 'subject_summary_rising';
    const loinc = '2345-7';

    // now = 2025-06-01, window=3 months => from ~ 2025-03-01 (calendar months)
    await prisma.observation.createMany({
      data: [
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 100,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-04-01T00:00:00.000Z')
        },
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 120,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-05-01T00:00:00.000Z')
        }
      ]
    });

    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(200);

    expect(res.body.trend).toBe('rising');
    expect(res.body.lastUpdated).toBe('2025-05-01T00:00:00.000Z');
    expect(res.body.lastValue).toEqual({ value: 120, unit: 'mg/dL' });
  });

  it('returns trend falling when last two normalized points decrease (within window months)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00.000Z'));
    const subjectId = 'subject_summary_falling';
    const loinc = '2345-7';

    await prisma.observation.createMany({
      data: [
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 120,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-04-01T00:00:00.000Z')
        },
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 100,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-05-01T00:00:00.000Z')
        }
      ]
    });

    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(200);

    expect(res.body.trend).toBe('falling');
    expect(res.body.lastValue.unit).toBe('mg/dL');
    expect(res.body.lastValue.value).toBe(100);
  });

  it('returns trend stable when delta is within tolerance', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00.000Z'));
    const subjectId = 'subject_summary_stable';
    const loinc = '2345-7';

    await prisma.observation.createMany({
      data: [
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 100,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-04-01T00:00:00.000Z')
        },
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 101,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-05-01T00:00:00.000Z')
        }
      ]
    });

    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(200);

    expect(res.body.trend).toBe('stable');
  });

  it('returns 404 when no observations exist in the window', async () => {
    const subjectId = 'subject_summary_empty';
    const loinc = '2345-7';
    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(404);

    expect(JSON.stringify(res.body)).toContain('No observations found');
  });

  it('returns stable trend when only one observation exists in window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00.000Z'));
    const subjectId = 'subject_summary_one_point';
    const loinc = '2345-7';

    await prisma.observation.create({
      data: {
        subjectId,
        analyte: 'glucose',
        loinc,
        valueRaw: 120,
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-05-01T00:00:00.000Z')
      }
    });

    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(200);

    expect(res.body.trend).toBe('stable');
    expect(res.body.lastValue.value).toBe(120);
  });

  it('ignores points outside the window (months)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00.000Z'));
    const subjectId = 'subject_summary_window';
    const loinc = '2345-7';

    // One point outside the window (Feb), one inside (May)
    await prisma.observation.createMany({
      data: [
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 50,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-02-01T00:00:00.000Z') // outside 3-month window from 2025-06-01
        },
        {
          subjectId,
          analyte: 'glucose',
          loinc,
          valueRaw: 120,
          unitRaw: 'mg/dL',
          measuredAt: new Date('2025-05-01T00:00:00.000Z') // inside window
        }
      ]
    });

    const res = await request(app)
      .get('/summary')
      .query({ subjectId, loinc, window: 3 })
      .expect(200);

    // Only one point in-window => trend should be stable
    expect(res.body.trend).toBe('stable');
    expect(res.body.lastValue.value).toBe(120);
  });
});
