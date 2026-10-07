import type { EventDocument } from './events.model.ts';

export interface PublicEvent {
  id: string;
  weddingId: string;
  name: string;
  type?: string;
  startsAt: Date;
  endsAt?: Date;
  venueName?: string;
  address?: string;
  description?: string;
  createdAt: Date;
}

export function toPublicEvent(event: EventDocument): PublicEvent {
  return {
    id: event._id.toString(),
    weddingId: event.weddingId.toString(),
    name: event.name,
    type: event.type,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venueName: event.venueName,
    address: event.address,
    description: event.description,
    createdAt: event.createdAt,
  };
}
