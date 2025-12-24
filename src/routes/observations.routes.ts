import { Router } from 'express';
import { listObservationsHandler } from '../controllers/observations.controller';

export const observationsRouter = Router();

observationsRouter.get('/observations', listObservationsHandler);
