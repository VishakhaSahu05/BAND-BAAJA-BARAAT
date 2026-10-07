import type { MetricAccent } from '../../components/MetricCard';

/**
 * Shape of the data the "Wedding Overview & Dashboard" page renders, as
 * returned by `GET /weddings/:weddingId/dashboard` plus the static `quote`,
 * which is client-side branding copy.
 */
export interface DashboardData {
  wedding: WeddingSummary;
  countdown: CountdownSummary;
  metrics: MetricCardEntry[];
  ceremonies: CeremonyItineraryEntry[];
  criticalTasks: CriticalTaskEntry[];
  familyCircle: FamilyMemberEntry[];
  venue: VenueSummary;
  quote: ShlokaQuote;
}

export interface WeddingSummary {
  coupleName: string;
  eventLabel: string;
  venueLine: string;
  scheduleLine: string;
  description: string;
}

export interface CountdownSummary {
  targetDateIso: string;
  muhuratTimeLabel?: string;
}

export interface MetricCardEntry {
  id: string;
  label: string;
  value: string;
  valueSuffix: string;
  badgeText: string;
  accent: MetricAccent;
  progressPercent: number;
}

export interface CeremonyItineraryEntry {
  id: string;
  name: string;
  /** Overlay ribbon on the cover image, e.g. "Day 1". */
  ribbonLabel: string;
  timeLocationLabel: string;
  description: string;
  dressCode?: string;
  /** Optional right-side badge (e.g. "Live DJ"); when absent a decorative icon is shown instead. */
  metaBadgeLabel?: string;
  accent: MetricAccent;
  imageSrc: string;
  imageAlt: string;
}

export interface CriticalTaskEntry {
  id: string;
  title: string;
  dueLabel: string;
  accent: MetricAccent;
  completed: boolean;
}

export interface FamilyMemberEntry {
  id: string;
  initials: string;
  name: string;
  roleLabel: string;
  accent: MetricAccent;
}

export interface VenueSummary {
  name: string;
  detailLine: string;
  opsContactName?: string;
  phoneNumber?: string;
}

/** Static branding copy — no backend module. */
export interface ShlokaQuote {
  text: string;
  attribution: string;
}
