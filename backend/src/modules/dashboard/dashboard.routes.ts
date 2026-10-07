import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.ts';
import * as dashboardController from './dashboard.controller.ts';

export const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get('/', requireAuth, dashboardController.getDashboard);
