import { PrismaClient, Analyte } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjectId = 'subject_1'; //subject test

  await prisma.observation.createMany({
    data: [
      // GLUCOSE
      {
        subjectId,
        analyte: Analyte.glucose,
        loinc: '2345-7',
        valueRaw: 120,
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-01-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.glucose,
        loinc: '15074-8',
        valueRaw: 4.5,
        unitRaw: 'mmol/L',
        measuredAt: new Date('2025-02-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.glucose,
        loinc: '2345-7',
        valueRaw: 250, // out of range
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-03-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.glucose,
        loinc: '15074-8',
        valueRaw: 5.5,
        unitRaw: 'mmol/L',
        measuredAt: new Date('2025-04-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.glucose,
        loinc: '2345-7',
        valueRaw: 140,
        unitRaw: 'mg/dL',
        measuredAt: new Date('2025-05-01T01:00:00Z')
      },

      // CREATININE
      {
        subjectId,
        analyte: Analyte.creatinine,
        loinc: '14682-9',
        valueRaw: 65,
        unitRaw: 'umol/L',
        measuredAt: new Date('2025-01-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.creatinine,
        loinc: '2160-0',
        valueRaw: 7.1,
        unitRaw: 'mg/L',
        measuredAt: new Date('2025-02-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.creatinine,
        loinc: '14682-9',
        valueRaw: 120,
        unitRaw: 'umol/L',
        measuredAt: new Date('2025-03-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.creatinine,
        loinc: '2160-0',
        valueRaw: 9.5,
        unitRaw: 'mg/L',
        measuredAt: new Date('2025-04-01T01:00:00Z')
      },
      {
        subjectId,
        analyte: Analyte.creatinine,
        loinc: '14682-9',
        valueRaw: 105,
        unitRaw: 'umol/L',
        measuredAt: new Date('2025-05-01T01:00:00Z')
      }
    ]
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
