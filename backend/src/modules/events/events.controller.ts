import type { Request, Response } from 'express';
import type { PublicUser } from '../auth/auth.types.ts';
import { ApiError } from '../../utils/api-error.ts';
import * as eventsService from './events.service.ts';
import { createEventSchema, updateEventSchema } from './events.validation.ts';

function requireUser(request: Request): PublicUser {
  if (!request.user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required.');
  }
  return request.user;
}

function requireParam(request: Request, name: 'weddingId' | 'eventId'): string {
  const value = request.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ApiError('VALIDATION_ERROR', `${name} is required.`);
  }
  return value;
}

export async function listEvents(request: Request, response: Response): Promise<void> {
  const user = requireUser(request);
  const events = await eventsService.listEvents(user.id, requireParam(request, 'weddingId'));
  response.status(200).json({ data: events });
}

export async function createEvent(request: Request, response: Response): Promise<void> {
  const user = requireUser(request);
  const weddingId = requireParam(request, 'weddingId');
  const input = createEventSchema.parse(request.body);
  const event = await eventsService.createEvent(user.id, weddingId, input);
  response.status(201).json({ data: event });
}

export async function updateEvent(request: Request, response: Response): Promise<void> {
  const user = requireUser(request);
  const weddingId = requireParam(request, 'weddingId');
  const eventId = requireParam(request, 'eventId');
  const input = updateEventSchema.parse(request.body);
  const event = await eventsService.updateEvent(user.id, weddingId, eventId, input);
  response.status(200).json({ data: event });
}

export async function archiveEvent(request: Request, response: Response): Promise<void> {
  const user = requireUser(request);
  await eventsService.archiveEvent(user.id, requireParam(request, 'weddingId'), requireParam(request, 'eventId'));
  response.status(204).send();
}
