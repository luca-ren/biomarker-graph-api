import { Router } from 'express';
import { observationsRouter } from './observations.routes';
import { seriesRouter } from './series.routes';
import { summaryRouter } from './summary.routes';

export const router = Router();

router.use(observationsRouter);
router.use(seriesRouter);
router.use(summaryRouter);
