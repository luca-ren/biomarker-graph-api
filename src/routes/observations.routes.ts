import { Router } from 'express';
import {
  createObservationHandler,
  getObservationByIdHandler,
  listObservationsHandler
} from '../controllers/observations.controller';
import { asyncHandler } from '../http/asyncHandler';

export const observationsRouter = Router();

observationsRouter.get('/observations', asyncHandler(listObservationsHandler));
observationsRouter.get(
  '/observations/:id',
  asyncHandler(getObservationByIdHandler)
);
observationsRouter.post(
  '/observations',
  asyncHandler(createObservationHandler)
);
