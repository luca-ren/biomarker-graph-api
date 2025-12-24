import { Router } from 'express';
import { observationsRouter } from './observations.routes';

export const router = Router();

router.use(observationsRouter);
