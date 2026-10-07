import type {
  CeremonySpan,
  RsvpCollectionMode,
  VenueOpsContact,
  WeddingDocument,
  WeddingGuestEstimate,
  WeddingLocation,
} from './weddings.model.ts';

export interface PublicWedding {
  id: string;
  brideName: string;
  groomName: string;
  description?: string;
  hashtag?: string;
  weddingDate: Date;
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
  createdAt: Date;
}

export function toPublicWedding(wedding: WeddingDocument): PublicWedding {
  return {
    id: wedding._id.toString(),
    brideName: wedding.brideName,
    groomName: wedding.groomName,
    description: wedding.description,
    hashtag: wedding.hashtag,
    weddingDate: wedding.weddingDate,
    timeZone: wedding.timeZone,
    budgetPaise: wedding.budgetPaise,
    ceremonySpan: wedding.ceremonySpan,
    guestEstimate: wedding.guestEstimate,
    rsvpCollectionMode: wedding.rsvpCollectionMode,
    isItineraryPrivate: wedding.isItineraryPrivate,
    muhuratTimeLabel: wedding.muhuratTimeLabel,
    venueOpsContact: wedding.venueOpsContact,
    location: wedding.location,
    websiteSlug: wedding.website.slug,
    createdAt: wedding.createdAt,
  };
}
