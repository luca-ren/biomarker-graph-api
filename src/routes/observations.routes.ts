import { Router } from 'express';
import {
  createObservationHandler,
  listObservationsHandler
} from '../controllers/observations.controller';
import { asyncHandler } from '../http/asyncHandler';

export const observationsRouter = Router();

observationsRouter.get('/observations', asyncHandler(listObservationsHandler));
observationsRouter.post(
  '/observations',
  asyncHandler(createObservationHandler)
);
