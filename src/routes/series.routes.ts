import { Router } from 'express';
import { asyncHandler } from '../http/asyncHandler';
import { getSeriesHandler } from '../controllers/series.controller';

export const seriesRouter = Router();

seriesRouter.get('/series', asyncHandler(getSeriesHandler));
