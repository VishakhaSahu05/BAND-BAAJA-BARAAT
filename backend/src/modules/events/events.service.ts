import { Types } from 'mongoose';
import { ApiError } from '../../utils/api-error.ts';
import { buildUpdate } from '../../utils/build-update.ts';
import { assertWeddingMembership } from '../weddings/weddings.service.ts';
import * as eventsRepository from './events.repository.ts';
import { toPublicEvent, type PublicEvent } from './events.types.ts';
import type { CreateEventInput, UpdateEventInput } from './events.validation.ts';

function eventNotFound(): ApiError {
  return new ApiError('NOT_FOUND', 'Ceremony not found.');
}

export async function listEvents(userId: string, weddingId: string): Promise<PublicEvent[]> {
  await assertWeddingMembership(userId, weddingId);
  const events = await eventsRepository.findActiveEventsByWeddingId(weddingId);
  return events.map(toPublicEvent);
}

export async function createEvent(userId: string, weddingId: string, input: CreateEventInput): Promise<PublicEvent> {
  await assertWeddingMembership(userId, weddingId);
  const event = await eventsRepository.createEvent({ ...input, weddingId: new Types.ObjectId(weddingId) });
  return toPublicEvent(event);
}

export async function updateEvent(
  userId: string,
  weddingId: string,
  eventId: string,
  input: UpdateEventInput,
): Promise<PublicEvent> {
  await assertWeddingMembership(userId, weddingId);
  if (!Types.ObjectId.isValid(eventId)) {
    throw eventNotFound();
  }

  const event = await eventsRepository.updateActiveEvent(weddingId, eventId, buildUpdate(input));
  if (!event) {
    throw eventNotFound();
  }
  return toPublicEvent(event);
}

export async function archiveEvent(userId: string, weddingId: string, eventId: string): Promise<void> {
  await assertWeddingMembership(userId, weddingId);
  if (!Types.ObjectId.isValid(eventId)) {
    throw eventNotFound();
  }

  const event = await eventsRepository.archiveActiveEvent(weddingId, eventId);
  if (!event) {
    throw eventNotFound();
  }
}
