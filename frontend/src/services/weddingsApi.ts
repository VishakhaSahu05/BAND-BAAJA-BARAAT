import { apiRequest } from './apiClient';

export interface WeddingLocation {
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
}

export type CeremonySpan = '2_DAYS' | '3_DAYS' | '4_PLUS_DAYS';
export type RsvpCollectionMode = 'WHATSAPP_SMS' | 'MANUAL_LIST';
export type RitualType = 'MEHENDI' | 'HALDI' | 'SANGEET' | 'WEDDING' | 'RECEPTION' | 'CUSTOM';

export interface WeddingGuestEstimate {
  total: number;
  groomSide: number;
  brideSide: number;
}

export interface RitualInput {
  name: string;
  type?: RitualType;
}

export interface Wedding {
  id: string;
  brideName: string;
  groomName: string;
  description?: string;
  hashtag?: string;
  weddingDate: string;
  timeZone: string;
  budgetPaise?: number;
  ceremonySpan?: CeremonySpan;
  guestEstimate?: WeddingGuestEstimate;
  rsvpCollectionMode?: RsvpCollectionMode;
  isItineraryPrivate: boolean;
  muhuratTimeLabel?: string;
  venueOpsContact?: VenueOpsContact;
  location: WeddingLocation;
  websiteSlug: string;
  createdAt: string;
}

export interface VenueOpsContact {
  name: string;
  phoneNumber: string;
}

/** Only the fields being changed; `null` clears an optional field. */
export interface UpdateWeddingInput {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  timeZone?: string;
  location?: WeddingLocation;
  budgetPaise?: number | null;
  description?: string | null;
  hashtag?: string | null;
  muhuratTimeLabel?: string | null;
  venueOpsContact?: VenueOpsContact | null;
}

export interface CreateWeddingInput {
  brideName: string;
  groomName: string;
  weddingDate: string;
  timeZone: string;
  location: WeddingLocation;
  budgetPaise?: number;
  description?: string;
  hashtag?: string;
  rituals?: RitualInput[];
  ceremonySpan?: CeremonySpan;
  guestEstimate?: WeddingGuestEstimate;
  rsvpCollectionMode?: RsvpCollectionMode;
  isItineraryPrivate?: boolean;
}

export function createWedding(input: CreateWeddingInput): Promise<Wedding> {
  return apiRequest<Wedding>('/weddings', { method: 'POST', body: input });
}

export function getCurrentWedding(): Promise<Wedding> {
  return apiRequest<Wedding>('/weddings/current');
}

export function updateWedding(weddingId: string, input: UpdateWeddingInput): Promise<Wedding> {
  return apiRequest<Wedding>(`/weddings/${encodeURIComponent(weddingId)}`, { method: 'PATCH', body: input });
}
