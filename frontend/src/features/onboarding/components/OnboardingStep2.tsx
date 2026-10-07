import { useState, type FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import type { CeremonySpan, RitualInput } from '../../../services/weddingsApi';
import { PRESET_RITUALS, type OnboardingState } from '../types';
import { OnboardingShell } from './OnboardingShell';

interface OnboardingStep2Props {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CEREMONY_SPAN_OPTIONS: Array<{ value: CeremonySpan; label: string }> = [
  { value: '2_DAYS', label: '2 Days Celebration' },
  { value: '3_DAYS', label: '3 Days Royal Utsav' },
  { value: '4_PLUS_DAYS', label: '4+ Days Extravaganza' },
];

function isRitualSelected(rituals: RitualInput[], ritual: RitualInput): boolean {
  return rituals.some((selected) => selected.name === ritual.name);
}

export function OnboardingStep2({ state, onChange, onNext, onBack }: OnboardingStep2Props) {
  const [customRitualName, setCustomRitualName] = useState('');

  function toggleRitual(ritual: RitualInput) {
    if (isRitualSelected(state.rituals, ritual)) {
      onChange({ rituals: state.rituals.filter((selected) => selected.name !== ritual.name) });
    } else {
      onChange({ rituals: [...state.rituals, ritual] });
    }
  }

  function addCustomRitual() {
    const name = customRitualName.trim();
    if (!name || isRitualSelected(state.rituals, { name })) {
      return;
    }
    onChange({ rituals: [...state.rituals, { name, type: 'CUSTOM' }] });
    setCustomRitualName('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNext();
  }

  return (
    <OnboardingShell
      icon="celebration"
      title="Craft your celebration flow"
      subtitle="Select key ceremonies, royal destination venue and estimated budget."
      step={2}
    >
      <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-label-md text-on-surface-variant font-semibold">
              Rituals & Auspicious Ceremonies *
            </label>
            <span className="text-label-sm text-on-surface-variant">{state.rituals.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_RITUALS.map((ritual) => {
              const selected = isRitualSelected(state.rituals, ritual);
              return (
                <button
                  key={ritual.name}
                  type="button"
                  onClick={() => toggleRitual(ritual)}
                  className={`text-label-md inline-flex items-center gap-1 py-1.5 px-3 rounded-full border font-semibold transition-colors duration-150 ${
                    selected
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  {selected ? <Icon name="check" style={{ fontSize: 16 }} /> : null}
                  {ritual.name}
                </button>
              );
            })}
            {state.rituals
              .filter((ritual) => ritual.type === 'CUSTOM')
              .map((ritual) => (
                <button
                  key={ritual.name}
                  type="button"
                  onClick={() => toggleRitual(ritual)}
                  className="text-label-md inline-flex items-center gap-1 py-1.5 px-3 rounded-full border bg-primary text-on-primary border-primary font-semibold"
                >
                  <Icon name="check" style={{ fontSize: 16 }} />
                  {ritual.name}
                </button>
              ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              placeholder="Add Custom Ritual"
              value={customRitualName}
              onChange={(event) => setCustomRitualName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCustomRitual();
                }
              }}
              className="text-body-sm flex-1 rounded-full border border-dashed border-outline-variant bg-surface px-3 py-1.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addCustomRitual}
              className="text-label-md inline-flex items-center gap-1 py-1.5 px-3 rounded-full border border-outline-variant bg-transparent text-on-surface-variant font-semibold hover:border-primary hover:text-primary"
            >
              <Icon name="add" style={{ fontSize: 16 }} />
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="step2Venue" className="text-label-md text-on-surface-variant font-semibold">
              Destination Palace or Primary Venue
            </label>
            <span className="text-label-sm text-primary font-semibold">Curated Palaces</span>
          </div>
          <div className="relative">
            <Icon
              name="location_on"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              style={{ fontSize: 18 }}
            />
            <input
              id="step2Venue"
              type="text"
              required
              value={state.venue}
              onChange={(event) => onChange({ venue: event.target.value })}
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="step2Budget" className="text-label-md text-on-surface-variant font-semibold">
            Total Estimated Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">₹</span>
            <input
              id="step2Budget"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={state.budget}
              onChange={(event) => onChange({ budget: event.target.value })}
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-8 pr-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <Icon name="info" style={{ fontSize: 14 }} />
            Auto-allocates budget guidance for catering, decor &amp; entertainment.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-md text-on-surface-variant font-semibold">Ceremony Span &amp; Duration</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CEREMONY_SPAN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ceremonySpan: option.value })}
                className={`text-label-md py-2 px-3 rounded-lg border font-semibold transition-colors duration-150 ${
                  state.ceremonySpan === option.value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-label-lg inline-flex items-center gap-1 py-2.5 px-4 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold hover:bg-surface-container"
          >
            <Icon name="arrow_back" style={{ fontSize: 18 }} />
            Back
          </button>
          <button
            type="submit"
            className="text-label-lg flex-1 inline-flex items-center justify-center gap-1 bg-primary text-on-primary border-none py-2.5 rounded-lg font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-primary-container active:scale-95"
          >
            Continue to Guests &amp; Team
            <Icon name="arrow_forward" style={{ fontSize: 18 }} />
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
