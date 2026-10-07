import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type EventType = 'MEHENDI' | 'HALDI' | 'SANGEET' | 'WEDDING' | 'RECEPTION' | 'CUSTOM';

export interface EventAttributes {
  weddingId: Types.ObjectId;
  name: string;
  type?: EventType;
  startsAt: Date;
  endsAt?: Date;
  venueName?: string;
  address?: string;
  description?: string;
  coverImageObjectKey?: string;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<EventAttributes>;

const eventSchema = new Schema<EventAttributes>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['MEHENDI', 'HALDI', 'SANGEET', 'WEDDING', 'RECEPTION', 'CUSTOM'] },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    venueName: { type: String, trim: true },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    coverImageObjectKey: { type: String },
    archivedAt: { type: Date },
  },
  { timestamps: true },
);

eventSchema.index({ weddingId: 1, startsAt: 1 });
eventSchema.index({ weddingId: 1, archivedAt: 1 });

export const EventModel: Model<EventAttributes> = model<EventAttributes>('Event', eventSchema);
