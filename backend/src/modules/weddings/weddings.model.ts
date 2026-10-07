import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface WeddingLocation {
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
}

export interface WeddingWebsite {
  slug: string;
  theme: string;
  isPublished: boolean;
  welcomeMessage?: string;
}

export interface WeddingGallery {
  tokenHash: string;
  isEnabled: boolean;
  guestUploadsEnabled: boolean;
}

export interface WeddingLivestream {
  youtubeUrl?: string;
  isEnabled: boolean;
}

export interface VenueOpsContact {
  name: string;
  phoneNumber: string;
}

export interface WeddingGuestEstimate {
  total: number;
  groomSide: number;
  brideSide: number;
}

export type CeremonySpan = '2_DAYS' | '3_DAYS' | '4_PLUS_DAYS';
export type RsvpCollectionMode = 'WHATSAPP_SMS' | 'MANUAL_LIST';

export interface WeddingAttributes {
  brideName: string;
  groomName: string;
  description?: string;
  hashtag?: string;
  weddingDate: Date;
  timeZone: string;
  coverImageObjectKey?: string;
  budgetPaise?: number;
  ceremonySpan?: CeremonySpan;
  guestEstimate?: WeddingGuestEstimate;
  rsvpCollectionMode?: RsvpCollectionMode;
  isItineraryPrivate: boolean;
  muhuratTimeLabel?: string;
  venueOpsContact?: VenueOpsContact;
  location: WeddingLocation;
  website: WeddingWebsite;
  gallery: WeddingGallery;
  livestream: WeddingLivestream;
  createdByUserId: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WeddingDocument = HydratedDocument<WeddingAttributes>;

const locationSchema = new Schema<WeddingLocation>(
  {
    formattedAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    googlePlaceId: { type: String },
  },
  { _id: false },
);

const websiteSchema = new Schema<WeddingWebsite>(
  {
    slug: { type: String, required: true },
    theme: { type: String, required: true, default: 'classic' },
    isPublished: { type: Boolean, required: true, default: false },
    welcomeMessage: { type: String },
  },
  { _id: false },
);

const gallerySchema = new Schema<WeddingGallery>(
  {
    tokenHash: { type: String, required: true },
    isEnabled: { type: Boolean, required: true, default: true },
    guestUploadsEnabled: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const livestreamSchema = new Schema<WeddingLivestream>(
  {
    youtubeUrl: { type: String },
    isEnabled: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const venueOpsContactSchema = new Schema<VenueOpsContact>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const guestEstimateSchema = new Schema<WeddingGuestEstimate>(
  {
    total: { type: Number, required: true, min: 0 },
    groomSide: { type: Number, required: true, min: 0 },
    brideSide: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const weddingSchema = new Schema<WeddingAttributes>(
  {
    brideName: { type: String, required: true, trim: true },
    groomName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    hashtag: { type: String, trim: true },
    weddingDate: { type: Date, required: true },
    timeZone: { type: String, required: true },
    coverImageObjectKey: { type: String },
    budgetPaise: { type: Number },
    ceremonySpan: { type: String, enum: ['2_DAYS', '3_DAYS', '4_PLUS_DAYS'] },
    guestEstimate: { type: guestEstimateSchema },
    rsvpCollectionMode: { type: String, enum: ['WHATSAPP_SMS', 'MANUAL_LIST'] },
    isItineraryPrivate: { type: Boolean, required: true, default: true },
    muhuratTimeLabel: { type: String, trim: true },
    venueOpsContact: { type: venueOpsContactSchema },
    location: { type: locationSchema, required: true },
    website: { type: websiteSchema, required: true },
    gallery: { type: gallerySchema, required: true },
    livestream: { type: livestreamSchema, required: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

weddingSchema.index({ 'website.slug': 1 }, { unique: true });
weddingSchema.index({ 'gallery.tokenHash': 1 }, { unique: true });
weddingSchema.index({ createdAt: 1 });

export const WeddingModel: Model<WeddingAttributes> = model<WeddingAttributes>('Wedding', weddingSchema);

export interface WeddingMembershipAttributes {
  userId: Types.ObjectId;
  weddingId: Types.ObjectId;
  access: string;
  relationshipLabel?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WeddingMembershipDocument = HydratedDocument<WeddingMembershipAttributes>;

const weddingMembershipSchema = new Schema<WeddingMembershipAttributes>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    access: { type: String, required: true, default: 'COLLABORATOR' },
    relationshipLabel: { type: String, trim: true },
    joinedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

weddingMembershipSchema.index({ userId: 1 }, { unique: true });
weddingMembershipSchema.index({ weddingId: 1, userId: 1 }, { unique: true });

export const WeddingMembershipModel: Model<WeddingMembershipAttributes> = model<WeddingMembershipAttributes>(
  'WeddingMembership',
  weddingMembershipSchema,
);
