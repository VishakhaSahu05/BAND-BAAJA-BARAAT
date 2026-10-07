import { apiRequest } from './apiClient';
import type { RitualType } from './weddingsApi';

export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  type?: RitualType;
  startsAt: string;
  venueName?: string;
  description?: string;
}

export interface CreateEventInput {
  name: string;
  startsAt: string;
  type?: RitualType;
  venueName?: string;
  description?: string;
}

/** `null` clears an optional field. */
export interface UpdateEventInput {
  name?: string;
  startsAt?: string;
  venueName?: string | null;
  description?: string | null;
}

function eventsPath(weddingId: string): string {
  return `/weddings/${encodeURIComponent(weddingId)}/events`;
}

export function listEvents(weddingId: string): Promise<WeddingEvent[]> {
  return apiRequest<WeddingEvent[]>(eventsPath(weddingId));
}

export function createEvent(weddingId: string, input: CreateEventInput): Promise<WeddingEvent> {
  return apiRequest<WeddingEvent>(eventsPath(weddingId), { method: 'POST', body: input });
}

export function updateEvent(weddingId: string, eventId: string, input: UpdateEventInput): Promise<WeddingEvent> {
  return apiRequest<WeddingEvent>(`${eventsPath(weddingId)}/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    body: input,
  });
}

export function archiveEvent(weddingId: string, eventId: string): Promise<void> {
  return apiRequest<void>(`${eventsPath(weddingId)}/${encodeURIComponent(eventId)}/archive`, { method: 'POST' });
}
