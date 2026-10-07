import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.ts';
import { dashboardRouter } from '../dashboard/dashboard.routes.ts';
import { eventsRouter } from '../events/events.routes.ts';
import * as weddingsController from './weddings.controller.ts';

export const weddingsRouter = Router();

weddingsRouter.post('/', requireAuth, weddingsController.createWedding);
weddingsRouter.get('/current', requireAuth, weddingsController.getCurrentWedding);
weddingsRouter.patch('/:weddingId', requireAuth, weddingsController.updateWedding);
weddingsRouter.use('/:weddingId/events', eventsRouter);
weddingsRouter.use('/:weddingId/dashboard', dashboardRouter);
