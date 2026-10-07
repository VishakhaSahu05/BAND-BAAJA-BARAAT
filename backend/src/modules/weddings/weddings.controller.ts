import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error.ts';
import * as weddingsService from './weddings.service.ts';
import { createWeddingSchema, updateWeddingSchema } from './weddings.validation.ts';

export async function createWedding(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  const input = createWeddingSchema.parse(request.body);
  const wedding = await weddingsService.createWedding(request.user.id, input);

  response.status(201).json({ data: wedding });
}

export async function updateWedding(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  const weddingId = request.params.weddingId;
  if (typeof weddingId !== 'string' || weddingId.length === 0) {
    throw new ApiError('VALIDATION_ERROR', 'weddingId is required.');
  }

  const input = updateWeddingSchema.parse(request.body);
  const wedding = await weddingsService.updateWedding(request.user.id, weddingId, input);

  response.status(200).json({ data: wedding });
}

export async function getCurrentWedding(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }

  const wedding = await weddingsService.getCurrentWedding(request.user.id);
  response.status(200).json({ data: wedding });
}
