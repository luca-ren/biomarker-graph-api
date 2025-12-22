-- CreateEnum
CREATE TYPE "public"."Analyte" AS ENUM ('glucose', 'creatinine');

-- CreateTable
CREATE TABLE "public"."Observation" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "analyte" "public"."Analyte" NOT NULL,
    "loinc" TEXT,
    "valueRaw" DECIMAL(65,30) NOT NULL,
    "unitRaw" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Observation_subjectId_analyte_measuredAt_idx" ON "public"."Observation"("subjectId", "analyte", "measuredAt");

-- CreateIndex
CREATE INDEX "Observation_subjectId_loinc_measuredAt_idx" ON "public"."Observation"("subjectId", "loinc", "measuredAt");
