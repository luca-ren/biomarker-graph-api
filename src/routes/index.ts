import { Router } from 'express';
import { observationsRouter } from './observations.routes';
import { seriesRouter } from './series.routes';

export const router = Router();

router.use(observationsRouter);
router.use(seriesRouter);
