import type { MetricAccent } from '../../components/MetricCard';

/**
 * Shape of the data the "Wedding Overview & Dashboard" page renders.
 *
 * This mirrors the aggregate `GET /weddings/:weddingId/dashboard` endpoint
 * documented in the REST API Design doc (§17). That endpoint's exact response
 * fields aren't specified yet, so this type is this frontend's own working
 * contract — deliberately shaped to be easy to satisfy from a real API
 * response later without changing the components that consume it.
 *
 * Fields marked "UI-only / no schema field yet" are shown in the Stitch
 * design but have no backing field in the Database Design doc today. They
 * are included here only so the mock data can render the design faithfully;
 * see the implementation report for the schema/product decisions needed
 * before they can be wired to a real API.
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

/** Domain module: wedding (`weddings` collection). */
export interface WeddingSummary {
  coupleName: string;
  hostRoleLabel: string;
  eventLabel: string;
  venueLine: string;
  scheduleLine: string;
  description: string;
}

/** Domain module: wedding (`weddings.weddingDate` + `weddings.timeZone`). */
export interface CountdownSummary {
  targetDateIso: string;
  /** UI-only / no schema field yet — see Open Questions in the plan. */
  muhuratTimeLabel: string;
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

/** Domain module: events (`events` collection). */
export interface CeremonyItineraryEntry {
  id: string;
  name: string;
  /** Overlay ribbon on the cover image, e.g. "Day 1 • Morning". */
  ribbonLabel: string;
  timeLocationLabel: string;
  description: string;
  dressCode: string;
  /** Optional right-side badge (e.g. "Live DJ"); when absent a decorative icon is shown instead. */
  metaBadgeLabel?: string;
  accent: MetricAccent;
  imageSrc: string;
  imageAlt: string;
}

/** Domain module: tasks (`tasks` collection). */
export interface CriticalTaskEntry {
  id: string;
  title: string;
  dueLabel: string;
  accent: MetricAccent;
  completed: boolean;
}

/**
 * Domain module: wedding_memberships (`wedding_memberships` + `users`).
 * `roleLabel` is UI-only / no schema field yet — the documented membership
 * schema only has a broad `access` field, not a relationship label.
 */
export interface FamilyMemberEntry {
  id: string;
  initials: string;
  name: string;
  roleLabel: string;
  accent: MetricAccent;
}

/**
 * Domain module: wedding (`weddings.location`).
 * `opsContactName` and `phoneNumber` are UI-only / no schema field yet — see
 * Open Questions (possible future mapping via a venue-category Vendor record).
 */
export interface VenueSummary {
  name: string;
  detailLine: string;
  opsContactName: string;
  phoneNumber: string;
}

/** Static branding copy — no backend module. */
export interface ShlokaQuote {
  text: string;
  attribution: string;
}
