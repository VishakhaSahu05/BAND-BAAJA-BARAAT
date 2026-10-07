import { useEffect, useState, type FormEvent } from 'react';
import { FormModal } from '../../../components/FormModal';
import { ApiClientError } from '../../../services/apiClient';
import * as eventsApi from '../../../services/eventsApi';
import type { WeddingEvent } from '../../../services/eventsApi';
import { dateInputValue } from '../dateInput';

const INPUT_CLASS =
  'text-body-md w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary';
const LABEL_CLASS = 'text-label-md text-on-surface-variant font-semibold';

interface EditCeremonyModalProps {
  weddingId: string;
  /** `null` adds a new ceremony. */
  eventId: string | null;
  defaultDate: string;
  timeZone: string;
  onClose: () => void;
  onSaved: () => void;
}

function errorText(error: unknown): string {
  return error instanceof ApiClientError ? error.displayMessage : 'Something went wrong. Please try again.';
}

export function EditCeremonyModal({
  weddingId,
  eventId,
  defaultDate,
  timeZone,
  onClose,
  onSaved,
}: EditCeremonyModalProps) {
  const isNew = eventId === null;
  const [original, setOriginal] = useState<WeddingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [name, setName] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [venueName, setVenueName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (eventId === null) {
      return;
    }

    let cancelled = false;
    eventsApi
      .listEvents(weddingId)
      .then((events) => {
        if (cancelled) {
          return;
        }
        const event = events.find((candidate) => candidate.id === eventId);
        if (!event) {
          setErrorMessage('This ceremony no longer exists.');
          return;
        }
        setOriginal(event);
        setName(event.name);
        setDate(dateInputValue(event.startsAt, timeZone));
        setVenueName(event.venueName ?? '');
        setDescription(event.description ?? '');
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(errorText(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [weddingId, eventId, timeZone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      if (eventId === null) {
        await eventsApi.createEvent(weddingId, {
          name: name.trim(),
          type: 'CUSTOM',
          startsAt: date,
          venueName: venueName.trim() || undefined,
          description: description.trim() || undefined,
        });
      } else {
        await eventsApi.updateEvent(weddingId, eventId, {
          name: name.trim(),
          // Only resend the date when it changed, so a precise start time set elsewhere is preserved.
          startsAt: original && date === dateInputValue(original.startsAt, timeZone) ? undefined : date,
          venueName: venueName.trim() || null,
          description: description.trim() || null,
        });
      }
      onSaved();
    } catch (error) {
      setErrorMessage(errorText(error));
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    if (eventId === null) {
      return;
    }
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await eventsApi.archiveEvent(weddingId, eventId);
      onSaved();
    } catch (error) {
      setErrorMessage(errorText(error));
      setIsSaving(false);
    }
  }

  const canEdit = isNew || original !== null;

  return (
    <FormModal
      title={isNew ? 'Add ceremony' : 'Edit ceremony'}
      icon={isNew ? 'add' : 'edit'}
      onClose={onClose}
      isBusy={isSaving}
    >
      {isLoading ? (
        <p className="text-body-md text-on-surface-variant py-6 text-center">Loading ceremony…</p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p role="alert" className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          ) : null}

          {canEdit ? (
            <>
              <label className="flex flex-col gap-1">
                <span className={LABEL_CLASS}>Ceremony Name *</span>
                <input
                  required
                  maxLength={200}
                  placeholder="e.g. Haldi & Mehendi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className={LABEL_CLASS}>Date *</span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className={LABEL_CLASS}>Venue</span>
                <input
                  maxLength={200}
                  placeholder="e.g. Durbar Hall"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-body-sm text-on-surface-variant">
                  Ceremonies with a venue count as set in Ritual Milestones.
                </span>
              </label>

              <label className="flex flex-col gap-1">
                <span className={LABEL_CLASS}>Description</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. Traditional turmeric ceremony followed by henna artistry."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${INPUT_CLASS} resize-none`}
                />
              </label>
            </>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {!isNew && canEdit ? (
              isConfirmingRemove ? (
                <span className="flex items-center gap-2">
                  <span className="text-body-sm text-on-surface">Remove this ceremony?</span>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleRemove()}
                    className="text-label-md py-1.5 px-3 rounded-lg border-none bg-secondary text-on-secondary font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsConfirmingRemove(false)}
                    className="text-label-md py-1.5 px-3 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  >
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsConfirmingRemove(true)}
                  className="text-label-md py-1.5 px-3 rounded-lg border border-outline-variant bg-transparent text-secondary font-semibold hover:bg-secondary-soft disabled:opacity-60 disabled:pointer-events-none"
                >
                  Remove ceremony
                </button>
              )
            ) : null}
            <span className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="text-label-lg py-2.5 px-4 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold hover:bg-surface-container disabled:opacity-60 disabled:pointer-events-none"
              >
                Cancel
              </button>
              {canEdit ? (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="text-label-lg py-2.5 px-5 rounded-lg border-none bg-primary text-on-primary font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] hover:bg-primary-container active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSaving ? 'Saving…' : isNew ? 'Add Ceremony' : 'Save Changes'}
                </button>
              ) : null}
            </span>
          </div>
        </form>
      )}
    </FormModal>
  );
}
