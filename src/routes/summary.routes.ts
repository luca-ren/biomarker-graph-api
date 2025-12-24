import { Router } from 'express';
import { asyncHandler } from '../http/asyncHandler';
import { getSummaryHandler } from '../controllers/summary.controller';

export const summaryRouter = Router();
summaryRouter.get('/summary', asyncHandler(getSummaryHandler));
