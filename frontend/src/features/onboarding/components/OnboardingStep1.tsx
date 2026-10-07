import type { FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import type { OnboardingState } from '../types';
import { OnboardingShell } from './OnboardingShell';

interface OnboardingStep1Props {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingStep1({ state, onChange, onNext, onSkip }: OnboardingStep1Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNext();
  }

  return (
    <OnboardingShell
      badgeLabel="Shubh Muhurat Orchestration"
      icon="favorite"
      title="Let's set up your celebration"
      subtitle="This becomes your wedding's central command deck — easily coordinate, invite, and celebrate with zero friction."
      step={1}
    >
      <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="brideName" className="text-label-md text-on-surface-variant font-semibold">
              Bride&apos;s Name *
            </label>
            <div className="relative">
              <Icon
                name="favorite"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="brideName"
                type="text"
                required
                placeholder="e.g. Ananya Singhania"
                value={state.brideName}
                onChange={(event) => onChange({ brideName: event.target.value })}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="groomName" className="text-label-md text-on-surface-variant font-semibold">
              Groom&apos;s Name *
            </label>
            <div className="relative">
              <Icon
                name="person"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="groomName"
                type="text"
                required
                placeholder="e.g. Kabir Mehra"
                value={state.groomName}
                onChange={(event) => onChange({ groomName: event.target.value })}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="weddingDate" className="text-label-md text-on-surface-variant font-semibold">
                Wedding Date
              </label>
              <span className="text-label-sm text-primary font-bold uppercase">Auspicious</span>
            </div>
            <div className="relative">
              <Icon
                name="calendar_today"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="weddingDate"
                type="date"
                required
                value={state.weddingDate}
                onChange={(event) => onChange({ weddingDate: event.target.value })}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="timeZone" className="text-label-md text-on-surface-variant font-semibold">
              Time Zone
            </label>
            <div className="relative">
              <Icon
                name="schedule"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <select
                id="timeZone"
                value={state.timeZone}
                onChange={(event) => onChange({ timeZone: event.target.value })}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                <option value="America/New_York">America/New York (EST -5:00)</option>
                <option value="Europe/London">Europe/London (GMT +0:00)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="venue" className="text-label-md text-on-surface-variant font-semibold">
              Main Venue or Destination
            </label>
            <span className="text-label-sm text-on-surface-variant">City, Palace or Resort</span>
          </div>
          <div className="relative">
            <Icon
              name="location_on"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              style={{ fontSize: 18 }}
            />
            <input
              id="venue"
              type="text"
              required
              placeholder="Rambagh Palace, Jaipur, Rajasthan"
              value={state.venue}
              onChange={(event) => onChange({ venue: event.target.value })}
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="budget" className="text-label-md text-on-surface-variant font-semibold">
            Total Estimated Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">₹</span>
            <input
              id="budget"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              placeholder="e.g. 65,00,000"
              value={state.budget}
              onChange={(event) => onChange({ budget: event.target.value })}
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-8 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <Icon name="info" style={{ fontSize: 14 }} />
            Auto-allocates suggested budgets for Catering, Decor, Mandap, and Shehnai.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="hashtag" className="text-label-md text-on-surface-variant font-semibold">
            Celebration Hashtag <span className="font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">#</span>
            <input
              id="hashtag"
              type="text"
              placeholder="e.g. AnanyaKabir2025 or TheAKAffair"
              value={state.hashtag}
              onChange={(event) => onChange({ hashtag: event.target.value })}
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-8 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-label-md text-on-surface-variant font-semibold">
            Short Welcome Story <span className="font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Tell your guests about the royal theme, Mehendi dress codes, or family welcome note…"
            value={state.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className="text-body-md w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="verified_user" style={{ fontSize: 14 }} className="text-primary" />
          End-to-end RSVP privacy. You can modify these details anytime from settings.
        </p>

        <button
          type="submit"
          className="text-label-lg inline-flex items-center justify-center gap-1 bg-primary text-on-primary border-none py-2.5 rounded-lg font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-primary-container active:scale-95"
        >
          Continue to Ceremonies & Venue
          <Icon name="arrow_forward" style={{ fontSize: 18 }} />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="text-body-sm text-center text-on-surface-variant bg-transparent border-none hover:underline"
        >
          I will customize this later — Explore blank dashboard
        </button>
      </form>
    </OnboardingShell>
  );
}
