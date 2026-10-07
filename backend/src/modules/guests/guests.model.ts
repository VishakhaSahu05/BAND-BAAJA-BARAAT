import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING';

export interface GuestAttributes {
  weddingId: Types.ObjectId;
  name: string;
  email?: string;
  emailNormalized?: string;
  phone?: string;
  maxGuests: number;
  invitedEventIds: Types.ObjectId[];
  notes?: string;
  invitationToken: string;
  invitationSentAt?: Date;
  lastReminderSentAt?: Date;
  reminderCount: number;
  rsvpStatus: RsvpStatus;
  attendingCount?: number;
  rsvpUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type GuestDocument = HydratedDocument<GuestAttributes>;

const guestSchema = new Schema<GuestAttributes>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    emailNormalized: { type: String },
    phone: { type: String, trim: true },
    maxGuests: { type: Number, required: true, min: 1 },
    invitedEventIds: { type: [Schema.Types.ObjectId], ref: 'Event', required: true, default: [] },
    notes: { type: String, trim: true },
    // Secret used in public RSVP links; never returned by ordinary reads.
    invitationToken: { type: String, required: true, select: false },
    invitationSentAt: { type: Date },
    lastReminderSentAt: { type: Date },
    reminderCount: { type: Number, required: true, default: 0 },
    rsvpStatus: { type: String, enum: ['PENDING', 'ATTENDING', 'NOT_ATTENDING'], required: true, default: 'PENDING' },
    attendingCount: { type: Number, min: 0 },
    rsvpUpdatedAt: { type: Date },
  },
  { timestamps: true },
);

guestSchema.index({ invitationToken: 1 }, { unique: true });
guestSchema.index({ weddingId: 1, rsvpStatus: 1 });
guestSchema.index({ weddingId: 1, name: 1 });
guestSchema.index({ weddingId: 1, emailNormalized: 1 });
guestSchema.index({ weddingId: 1, invitedEventIds: 1 });

export const GuestModel: Model<GuestAttributes> = model<GuestAttributes>('Guest', guestSchema);
