import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error.ts';
import * as dashboardService from './dashboard.service.ts';

export async function getDashboard(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  const weddingId = request.params.weddingId;
  if (typeof weddingId !== 'string' || weddingId.length === 0) {
    throw new ApiError('VALIDATION_ERROR', 'weddingId is required.');
  }

  const dashboard = await dashboardService.getDashboard(request.user.id, weddingId);
  response.status(200).json({ data: dashboard });
}
