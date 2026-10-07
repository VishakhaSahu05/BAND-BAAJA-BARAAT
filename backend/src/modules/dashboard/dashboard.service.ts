import { ApiError } from '../../utils/api-error.ts';
import * as eventsRepository from '../events/events.repository.ts';
import type { EventType } from '../events/events.model.ts';
import * as expensesRepository from '../expenses/expenses.repository.ts';
import * as guestsRepository from '../guests/guests.repository.ts';
import * as tasksRepository from '../tasks/tasks.repository.ts';
import * as vendorsRepository from '../vendors/vendors.repository.ts';
import type { CeremonySpan } from '../weddings/weddings.model.ts';
import * as weddingsRepository from '../weddings/weddings.repository.ts';
import { assertWeddingMembership } from '../weddings/weddings.service.ts';
import * as dashboardRepository from './dashboard.repository.ts';
import type { DashboardResponse, MetricAccent } from './dashboard.types.ts';

const CRITICAL_TASK_LIMIT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ROTATING_ACCENTS: MetricAccent[] = ['primary', 'secondary', 'tertiary'];

const CEREMONY_SPAN_LABELS: Record<CeremonySpan, string> = {
  '2_DAYS': '2 Auspicious Days',
  '3_DAYS': '3 Auspicious Days',
  '4_PLUS_DAYS': '4+ Auspicious Days',
};

const DEFAULT_CEREMONY_IMAGE =
  'https://images.unsplash.com/photo-1574496026439-0781c4cad842?q=80&w=800&auto=format&fit=crop';

const CEREMONY_IMAGES: Partial<Record<EventType, string>> = {
  HALDI: 'https://images.unsplash.com/photo-1681717166573-f71589207785?q=80&w=800&auto=format&fit=crop',
  MEHENDI: 'https://images.unsplash.com/photo-1681717166573-f71589207785?q=80&w=800&auto=format&fit=crop',
  SANGEET: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?q=80&w=800&auto=format&fit=crop',
};

function percentOf(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

function formatRupeesCompact(paise: number): string {
  const rupees = paise / 100;
  // Round to one decimal before picking the unit so ₹99.96L shows as ₹1Cr, not ₹100L.
  const crores = Math.round(rupees / 1_000_000) / 10;
  if (crores >= 1) {
    return `₹${String(crores)}Cr`;
  }
  const lakhs = Math.round(rupees / 10_000) / 10;
  if (lakhs >= 1) {
    return `₹${String(lakhs)}L`;
  }
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

/**
 * Calendar day of `date` as a UTC-midnight Date. Values stored at exactly UTC midnight are
 * date-only (e.g. the wedding date) and are taken as-is; real timestamps use the wedding's time zone.
 */
function calendarDay(date: Date, timeZone: string): Date {
  const isDateOnly =
    date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
  if (isDateOnly) {
    return date;
  }
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date)
    .split('-')
    .map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

function formatShortDate(date: Date, timeZone: string): string {
  return calendarDay(date, timeZone).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export async function getDashboard(userId: string, weddingId: string): Promise<DashboardResponse> {
  await assertWeddingMembership(userId, weddingId);

  const wedding = await weddingsRepository.findWeddingById(weddingId);
  if (!wedding) {
    throw new ApiError('NOT_FOUND', 'Wedding not found.');
  }

  const [events, invitedHeadcount, attendingHeadcount, openTasks, contracts, spentPaise, familyRows] = await Promise.all([
    eventsRepository.findActiveEventsByWeddingId(weddingId),
    guestsRepository.sumMaxGuests(weddingId),
    guestsRepository.sumAttendingCount(weddingId),
    tasksRepository.findUpcomingIncomplete(weddingId, CRITICAL_TASK_LIMIT),
    vendorsRepository.countContractStatus(weddingId),
    expensesRepository.sumAmountPaise(weddingId),
    dashboardRepository.listFamilyCircle(weddingId),
  ]);

  const guestEstimateTotal = wedding.guestEstimate?.total;
  const guestDenominator = guestEstimateTotal ?? invitedHeadcount;
  const guestPercent = percentOf(attendingHeadcount, guestDenominator);

  const budgetPaise = wedding.budgetPaise;
  // Badge shows real usage (can exceed 100% when overspent); the progress bar stays clamped.
  const budgetUsedPercent = budgetPaise ? Math.round((spentPaise / budgetPaise) * 100) : 0;
  const budgetPercent = budgetPaise ? percentOf(spentPaise, budgetPaise) : 0;

  const configuredRituals = events.filter((event) => Boolean(event.venueName)).length;
  const ritualPercent = percentOf(configuredRituals, events.length);

  const pendingContracts = contracts.total - contracts.signed;

  const { city, state, formattedAddress } = wedding.location;
  const venueLine = city === state ? formattedAddress : `${city}, ${state}`;
  const spanLabel = wedding.ceremonySpan ? CEREMONY_SPAN_LABELS[wedding.ceremonySpan] : 'Wedding Celebration';
  const timeZone = wedding.timeZone;
  // Day 1 is the earliest ceremony day (pre-wedding rituals often precede the wedding date).
  const firstDay = Math.min(
    calendarDay(wedding.weddingDate, timeZone).getTime(),
    ...events.map((event) => calendarDay(event.startsAt, timeZone).getTime()),
  );

  return {
    wedding: {
      coupleName: `${wedding.brideName} & ${wedding.groomName}`,
      eventLabel: 'Wedding Celebration',
      venueLine,
      scheduleLine: `${spanLabel} • ${events.length} ${events.length === 1 ? 'Ceremony' : 'Ceremonies'}`,
      description: wedding.description ?? '',
    },
    countdown: {
      targetDateIso: wedding.weddingDate.toISOString(),
      muhuratTimeLabel: wedding.muhuratTimeLabel,
    },
    metrics: [
      {
        id: 'guest-rsvps',
        label: 'Guest RSVPs',
        value: String(attendingHeadcount),
        valueSuffix:
          guestEstimateTotal !== undefined ? `/ ${guestEstimateTotal} Estimated` : `/ ${invitedHeadcount} Invited`,
        badgeText: `${guestPercent}%`,
        accent: 'tertiary',
        progressPercent: guestPercent,
      },
      {
        id: 'ceremony-budget',
        label: 'Ceremony Budget',
        value: formatRupeesCompact(spentPaise),
        valueSuffix: budgetPaise ? `/ ${formatRupeesCompact(budgetPaise)} Limit` : 'No budget set',
        badgeText: `${budgetUsedPercent}%`,
        accent: 'primary',
        progressPercent: budgetPercent,
      },
      {
        id: 'ritual-milestones',
        label: 'Ritual Milestones',
        value: `${configuredRituals} of ${events.length}`,
        valueSuffix: 'Ceremonies Set',
        badgeText: events.length > 0 && configuredRituals === events.length ? 'Ready' : 'In Progress',
        accent: 'secondary',
        progressPercent: ritualPercent,
      },
      {
        id: 'vendor-contracts',
        label: 'Vendor Contracts',
        value: `${contracts.signed} / ${contracts.total}`,
        valueSuffix: 'Signed',
        badgeText:
          contracts.total === 0 ? 'No vendors yet' : pendingContracts > 0 ? `${pendingContracts} Pending` : 'All Signed',
        accent: 'neutral',
        progressPercent: percentOf(contracts.signed, contracts.total),
      },
    ],
    ceremonies: events.map((event, index) => {
      const dayNumber = Math.round((calendarDay(event.startsAt, timeZone).getTime() - firstDay) / MS_PER_DAY) + 1;
      return {
        id: event._id.toString(),
        name: event.name,
        ribbonLabel: `Day ${dayNumber}`,
        timeLocationLabel: `${formatShortDate(event.startsAt, timeZone)} • ${event.venueName ?? 'Venue TBD'}`,
        description: event.description ?? '',
        accent: ROTATING_ACCENTS[index % ROTATING_ACCENTS.length]!,
        imageSrc: (event.type && CEREMONY_IMAGES[event.type]) ?? DEFAULT_CEREMONY_IMAGE,
        imageAlt: event.name,
      };
    }),
    criticalTasks: openTasks.map((task, index) => ({
      id: task._id.toString(),
      title: task.title,
      dueLabel: task.dueDate ? `Due ${formatShortDate(task.dueDate, timeZone)}` : 'No due date',
      accent: ROTATING_ACCENTS[index % ROTATING_ACCENTS.length]!,
      completed: false,
    })),
    familyCircle: familyRows.map((row, index) => ({
      id: row._id.toString(),
      initials: initialsOf(row.name),
      name: row.name,
      roleLabel: row.relationshipLabel ?? 'Family',
      accent: ROTATING_ACCENTS[index % ROTATING_ACCENTS.length]!,
    })),
    venue: {
      name: formattedAddress,
      detailLine: city === state ? wedding.location.country : `${city}, ${state}, ${wedding.location.country}`,
      opsContactName: wedding.venueOpsContact?.name,
      phoneNumber: wedding.venueOpsContact?.phoneNumber,
    },
  };
}
