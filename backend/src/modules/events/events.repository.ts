import type { ClientSession } from 'mongoose';
import { EventModel, type EventAttributes, type EventDocument } from './events.model.ts';

type NewEvent = Omit<EventAttributes, 'createdAt' | 'updatedAt'>;

export async function createEvents(events: NewEvent[], session?: ClientSession): Promise<EventDocument[]> {
  return EventModel.create(events, { session, ordered: true });
}

export async function createEvent(event: NewEvent): Promise<EventDocument> {
  return EventModel.create(event);
}

export async function findActiveEventsByWeddingId(weddingId: string): Promise<EventDocument[]> {
  return EventModel.find({ weddingId, archivedAt: null }).sort({ startsAt: 1 });
}

export async function updateActiveEvent(
  weddingId: string,
  eventId: string,
  update: { $set: Record<string, unknown>; $unset: Record<string, ''> },
): Promise<EventDocument | null> {
  return EventModel.findOneAndUpdate({ _id: eventId, weddingId, archivedAt: null }, update, {
    returnDocument: 'after',
    runValidators: true,
  });
}

export async function archiveActiveEvent(weddingId: string, eventId: string): Promise<EventDocument | null> {
  return EventModel.findOneAndUpdate(
    { _id: eventId, weddingId, archivedAt: null },
    { $set: { archivedAt: new Date() } },
    { returnDocument: 'after' },
  );
}
