# Biomarker Graph API

## Requirements

- Node.js >= 18
- Docker (for PostgreSQL)
- npm

## Dependencies

npm install

## Start PostgreSQL

docker compose up -d db

## Setup .env

cp .env.template .env

## Run database migrations and seed

npx prisma migrate deploy

npx prisma db seed

## start the API

npm run dev

## Run tests

docker compose exec db psql -U app -d app -c "CREATE DATABASE app_test;"

cp .env.test.template .env.test

npm test

## API Examples

$body = @{
subjectId = "subject_1"
analyte = "glucose"
loinc = "2345-7"
measuredAt = "2025-01-01T00:00:00.000Z"
value = 120
unit = "mg/dL"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/observations" -ContentType "application/json" -Body $body

### Get time series data

curl "http://localhost:3000/series?subjectId=subject_1&loinc=2345-7&targetUnit=mmol/L"

Response example:

{
"subjectId": "subject_1",
"loinc": "2345-7",
"analyte": "glucose",
"unit": "mmol/L",
"points": [
{
"id": "886d1338-1782-41c1-b00a-b8329b4561c2",
"measuredAt": "2025-01-01T00:00:00.000Z",
"raw": { "value": 120, "unit": "mg/dL" },
"normalized": { "value": 6.67, "unit": "mmol/L" }
}
]
}

### Get summary

curl "http://localhost:3000/summary?subjectId=subject_1&loinc=2345-7&window=10"
window is expressed in months (calendar months)

Response example:

{"lastValue":{"value":140,"unit":"mg/dL"},"lastUpdated":"2025-05-01T01:00:00.000Z","trend":"falling"}

## Design Notes

### Data model rationale

Observations are stored as raw measured values (valueRaw, unitRaw) to preserve original data.
Normalization and unit conversion are performed at read time to avoid data loss.

### Validation strategy

Future dates are rejected at ingestion time (POST /observations), not on read endpoints.
Unsupported analytes or units return typed validation errors.
Query validation is handled using Zod schemas.

### Conversion approach

Unit conversion is analyte-specific.
Conversion is performed only when needed.
Supported units:
Glucose: mg/dL, mmol/L
Creatinine: mg/dL, umol/L

## Summary trend logic

Trend is computed by comparing the last two normalized values.

A small tolerance is applied:
Glucose: 2 mg/dL or 0.1 mmol/L
Creatinine: 5 umol/L or 0.05 mg/dL

### Summary window semantics

The window query parameter represents a number of months.
Biomarker observations are typically collected monthly.
Month-based windows (1, 3, 6, 12) are more meaningful than day-based ranges.

Example:
window=3

returns observations measured within the last 3 calendar months.

### Summary endpoint behavior

If no observation exists in the given window, the API returns a 404.
If only one observation exists, the trend is reported as "stable".

### Possible future improvements

Support additional analytes and units.
Pagination and aggregation for summary endpoints

### Additional Information

Implemented a global error handler to return consistent, typed validation errors as required.
Added an async handler wrapper to ensure async exceptions are forwarded to the error handler.
Prisma singleton
Default unit chosen per analyte (glucose mg/dL, creatinine umol/L)

## Assumption

We suppose the window in the summary query represent the number of month we want to go back starting from the month of the request

## ADR (Architecture Decision Record)

### Decision 1: Store raw values and convert on read

Context: Biomarker values can be expressed in multiple units depending on the source.  
Decision: Raw values (valueRaw, unitRaw) are stored as-is, and normalization is performed at read time.  
Consequences: No precision is lost in storage, and additional units can be supported later without data migration.  
Alternatives considered: Storing only normalized values (rejected due to loss of original data).

### Decision 2: Reject future dates on ingestion only

Context: Observations represent historical medical measurements.  
Decision: Future `measuredAt` values are rejected only on `POST /observations`.  
Consequences: Read endpoints remain simple and do not enforce temporal constraints.  
Alternatives considered: Validating future dates on all read endpoints (unnecessary complexity).

### Decision 3: Summary window expressed in months

Context: The specification does not define the unit of the summary window.  
Decision: The window parameter represents calendar months.  
Consequences: The API aligns with typical biomarker collection frequency.  
Alternatives considered: Day-based windows.

## Questions / ambiguities

Should LOINC uniquely identify a measurement regardless of unit, or can the same LOINC appear with different units?
Should summary endpoints return data when only one observation exists, or always require at least two?
Are out-of-range values expected to be flagged explicitly in the API response?

## Time spent

Approximately 10 hours
