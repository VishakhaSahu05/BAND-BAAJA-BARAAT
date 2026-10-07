import { useState, type FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import type { RsvpCollectionMode } from '../../../services/weddingsApi';
import type { CoHostInvite, OnboardingState } from '../types';
import { OnboardingShell } from './OnboardingShell';

interface OnboardingStep3Props {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const RSVP_MODE_OPTIONS: Array<{
  value: RsvpCollectionMode;
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
}> = [
  {
    value: 'WHATSAPP_SMS',
    title: 'WhatsApp & SMS',
    description: 'Instant QR digital card, 1-click dietary survey & WhatsApp reminders.',
    icon: 'chat',
    recommended: true,
  },
  {
    value: 'MANUAL_LIST',
    title: 'Manual List',
    description: 'Spreadsheet style import or paper card logs managed by concierge.',
    icon: 'description',
  },
];

const ROLE_LABELS: Record<CoHostInvite['role'], string> = {
  PLANNER_COORDINATOR: 'Planner Coordinator',
  FAMILY_ADMIN: 'Family Admin',
};

function createCoHostId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function OnboardingStep3({ state, onChange, onSubmit, onBack, isSubmitting, errorMessage }: OnboardingStep3Props) {
  const [newContact, setNewContact] = useState('');

  // The backend requires groom + bride === total, so derive one side instead of rounding both.
  function updateGuestTotal(total: number) {
    const groomShare = state.guestTotal > 0 ? state.groomSideGuests / state.guestTotal : 0.5;
    const groomSideGuests = Math.round(total * groomShare);
    onChange({ guestTotal: total, groomSideGuests, brideSideGuests: total - groomSideGuests });
  }

  function updateSide(side: 'groomSideGuests' | 'brideSideGuests', value: string) {
    const count = Math.max(0, Math.floor(Number(value) || 0));
    const groomSideGuests = side === 'groomSideGuests' ? count : state.groomSideGuests;
    const brideSideGuests = side === 'brideSideGuests' ? count : state.brideSideGuests;
    onChange({ groomSideGuests, brideSideGuests, guestTotal: groomSideGuests + brideSideGuests });
  }

  function addCoHost() {
    const contact = newContact.trim();
    if (!contact) {
      return;
    }
    const coHost: CoHostInvite = { id: createCoHostId(), contact, role: 'FAMILY_ADMIN' };
    onChange({ coHosts: [...state.coHosts, coHost] });
    setNewContact('');
  }

  function removeCoHost(id: string) {
    onChange({ coHosts: state.coHosts.filter((coHost) => coHost.id !== id) });
  }

  function updateCoHostRole(id: string, role: CoHostInvite['role']) {
    onChange({
      coHosts: state.coHosts.map((coHost) => (coHost.id === id ? { ...coHost, role } : coHost)),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <OnboardingShell
      icon="favorite"
      title="Bring your loved ones together"
      subtitle="Configure your guest estimate and invite family or wedding planners to co-manage."
      step={3}
    >
      <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit} noValidate>
        {errorMessage ? (
          <p role="alert" className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 rounded-lg border border-outline-variant p-4">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant font-semibold flex items-center gap-1">
              <Icon name="groups" style={{ fontSize: 18 }} />
              Estimated Guest Count
            </span>
            <span className="text-title-md text-primary font-bold">{state.guestTotal} Guests</span>
          </div>
          <input
            type="range"
            min={50}
            max={1500}
            step={10}
            value={state.guestTotal}
            onChange={(event) => updateGuestTotal(Number(event.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>Intimate (50)</span>
            <span>Grand (500)</span>
            <span>Royal (1500+)</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <label className="flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant">Ladkewale (Groom)</span>
              <input
                type="number"
                min={0}
                value={state.groomSideGuests}
                onChange={(event) => updateSide('groomSideGuests', event.target.value)}
                className="text-body-md rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant">Ladkiwale (Bride)</span>
              <input
                type="number"
                min={0}
                value={state.brideSideGuests}
                onChange={(event) => updateSide('brideSideGuests', event.target.value)}
                className="text-body-md rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-md text-on-surface-variant font-semibold flex items-center gap-1">
            <Icon name="mark_email_read" style={{ fontSize: 18 }} />
            RSVP Collection Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RSVP_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ rsvpCollectionMode: option.value })}
                className={`text-left rounded-lg border p-3 transition-colors duration-150 ${
                  state.rsvpCollectionMode === option.value
                    ? 'border-primary bg-primary-soft'
                    : 'border-outline-variant bg-surface hover:border-primary'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-label-md text-on-surface font-bold flex items-center gap-1">
                    <Icon name={option.icon} style={{ fontSize: 16 }} className="text-primary" />
                    {option.title}
                  </span>
                  {option.recommended ? (
                    <span className="text-label-sm bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                      Recommended
                    </span>
                  ) : null}
                </span>
                <span className="text-body-sm text-on-surface-variant mt-1 block">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-label-md text-on-surface-variant font-semibold flex items-center gap-1">
              <Icon name="person_add" style={{ fontSize: 18 }} />
              Invite Co-Hosts &amp; Wedding Planner
            </label>
            <span className="text-label-sm text-on-surface-variant">Full edit permissions</span>
          </div>

          {state.coHosts.map((coHost) => (
            <div key={coHost.id} className="flex items-center gap-2">
              <span className="text-body-sm flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-on-surface truncate">
                {coHost.contact}
              </span>
              <select
                value={coHost.role}
                onChange={(event) => updateCoHostRole(coHost.id, event.target.value as CoHostInvite['role'])}
                className="text-body-sm rounded-lg border border-outline-variant bg-surface px-2 py-1.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Remove ${coHost.contact}`}
                onClick={() => removeCoHost(coHost.id)}
                className="text-on-surface-variant bg-transparent border-none p-1 hover:text-secondary"
              >
                <Icon name="close" style={{ fontSize: 18 }} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Email or phone number"
              value={newContact}
              onChange={(event) => setNewContact(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCoHost();
                }
              }}
              className="text-body-sm flex-1 rounded-lg border border-dashed border-outline-variant bg-surface px-3 py-1.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addCoHost}
              className="text-label-md inline-flex items-center gap-1 py-1.5 px-3 rounded-full border border-outline-variant bg-transparent text-on-surface-variant font-semibold hover:border-primary hover:text-primary"
            >
              <Icon name="add" style={{ fontSize: 16 }} />
              Add Co-Host or Vendor
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 rounded-lg border border-outline-variant p-3">
          <input
            type="checkbox"
            checked={state.isItineraryPrivate}
            onChange={(event) => onChange({ isItineraryPrivate: event.target.checked })}
            className="w-4 h-4 accent-primary rounded mt-0.5"
          />
          <span>
            <span className="text-label-md text-on-surface font-semibold block">
              Keep wedding itinerary &amp; live updates private
            </span>
            <span className="text-body-sm text-on-surface-variant">
              Only verified guests on your confirmed list can view venue locations, room bookings, and shubh
              muhurat timings.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-label-lg inline-flex items-center gap-1 py-2.5 px-4 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold hover:bg-surface-container disabled:opacity-60 disabled:pointer-events-none"
          >
            <Icon name="arrow_back" style={{ fontSize: 18 }} />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-label-lg flex-1 inline-flex items-center justify-center gap-1 bg-primary text-on-primary border-none py-2.5 rounded-lg font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-primary-container active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Setting Up…' : 'Complete Setup & Open Dashboard'}
            <Icon name="celebration" style={{ fontSize: 18 }} />
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
