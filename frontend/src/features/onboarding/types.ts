import type { CeremonySpan, RitualInput, RsvpCollectionMode } from '../../services/weddingsApi';

export interface CoHostInvite {
  id: string;
  contact: string;
  role: 'PLANNER_COORDINATOR' | 'FAMILY_ADMIN';
}

export interface OnboardingState {
  brideName: string;
  groomName: string;
  weddingDate: string;
  timeZone: string;
  venue: string;
  budget: string;
  hashtag: string;
  description: string;
  rituals: RitualInput[];
  ceremonySpan: CeremonySpan;
  guestTotal: number;
  groomSideGuests: number;
  brideSideGuests: number;
  rsvpCollectionMode: RsvpCollectionMode;
  coHosts: CoHostInvite[];
  isItineraryPrivate: boolean;
}

export const PRESET_RITUALS: Array<{ name: string; type: RitualInput['type'] }> = [
  { name: 'Haldi & Mehendi', type: 'HALDI' },
  { name: 'Sangeet Night', type: 'SANGEET' },
  { name: 'Vedic Vivah / Pheras', type: 'WEDDING' },
  { name: 'Reception Dinner', type: 'RECEPTION' },
];

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  brideName: '',
  groomName: '',
  weddingDate: '',
  timeZone: 'Asia/Kolkata',
  venue: '',
  budget: '',
  hashtag: '',
  description: '',
  rituals: [PRESET_RITUALS[0]!, PRESET_RITUALS[1]!, PRESET_RITUALS[2]!, PRESET_RITUALS[3]!],
  ceremonySpan: '3_DAYS',
  guestTotal: 350,
  groomSideGuests: 180,
  brideSideGuests: 170,
  rsvpCollectionMode: 'WHATSAPP_SMS',
  coHosts: [],
  isItineraryPrivate: true,
};
