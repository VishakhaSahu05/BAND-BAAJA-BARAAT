import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.ts';
import * as eventsController from './events.controller.ts';

export const eventsRouter = Router({ mergeParams: true });

eventsRouter.get('/', requireAuth, eventsController.listEvents);
eventsRouter.post('/', requireAuth, eventsController.createEvent);
eventsRouter.patch('/:eventId', requireAuth, eventsController.updateEvent);
eventsRouter.post('/:eventId/archive', requireAuth, eventsController.archiveEvent);
