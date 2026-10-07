import { useState, type FormEvent } from 'react';
import { FormModal } from '../../../components/FormModal';
import { ApiClientError } from '../../../services/apiClient';
import * as weddingsApi from '../../../services/weddingsApi';
import type { UpdateWeddingInput, Wedding } from '../../../services/weddingsApi';

const INPUT_CLASS =
  'text-body-md w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary';
const LABEL_CLASS = 'text-label-md text-on-surface-variant font-semibold';

const TIME_ZONES: Array<{ value: string; label: string }> = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
  { value: 'America/New_York', label: 'America/New York (EST -5:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT +0:00)' },
];

interface EditWeddingModalProps {
  wedding: Wedding;
  onClose: () => void;
  onSaved: (wedding: Wedding) => void;
}

function rupeesFromPaise(paise: number | undefined): string {
  return paise === undefined ? '' : String(paise / 100);
}

export function EditWeddingModal({ wedding, onClose, onSaved }: EditWeddingModalProps) {
  const [brideName, setBrideName] = useState(wedding.brideName);
  const [groomName, setGroomName] = useState(wedding.groomName);
  const [weddingDate, setWeddingDate] = useState(wedding.weddingDate.slice(0, 10));
  const [timeZone, setTimeZone] = useState(wedding.timeZone);
  const [venue, setVenue] = useState(wedding.location.formattedAddress);
  const [budget, setBudget] = useState(rupeesFromPaise(wedding.budgetPaise));
  const [hashtag, setHashtag] = useState(wedding.hashtag ?? '');
  const [description, setDescription] = useState(wedding.description ?? '');
  const [muhuratTimeLabel, setMuhuratTimeLabel] = useState(wedding.muhuratTimeLabel ?? '');
  const [contactName, setContactName] = useState(wedding.venueOpsContact?.name ?? '');
  const [contactPhone, setContactPhone] = useState(wedding.venueOpsContact?.phoneNumber ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timeZoneOptions = TIME_ZONES.some((option) => option.value === wedding.timeZone)
    ? TIME_ZONES
    : [{ value: wedding.timeZone, label: wedding.timeZone }, ...TIME_ZONES];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedContactName = contactName.trim();
    const trimmedContactPhone = contactPhone.trim();
    if (Boolean(trimmedContactName) !== Boolean(trimmedContactPhone)) {
      setErrorMessage('Please add both the venue contact name and phone number, or leave both empty.');
      return;
    }

    // Send only what changed, so saving one field can't overwrite edits made elsewhere since this loaded.
    const patch: UpdateWeddingInput = {};
    const trimmedBride = brideName.trim();
    const trimmedGroom = groomName.trim();
    const trimmedVenue = venue.trim();
    const trimmedHashtag = hashtag.trim();
    const trimmedDescription = description.trim();
    const trimmedMuhurat = muhuratTimeLabel.trim();
    const newBudgetPaise = budget.trim() ? Math.round(Number(budget) * 100) : undefined;

    if (trimmedBride !== wedding.brideName) patch.brideName = trimmedBride;
    if (trimmedGroom !== wedding.groomName) patch.groomName = trimmedGroom;
    if (weddingDate !== wedding.weddingDate.slice(0, 10)) patch.weddingDate = weddingDate;
    if (timeZone !== wedding.timeZone) patch.timeZone = timeZone;
    if (newBudgetPaise !== wedding.budgetPaise) patch.budgetPaise = newBudgetPaise ?? null;
    if (trimmedHashtag !== (wedding.hashtag ?? '')) patch.hashtag = trimmedHashtag || null;
    if (trimmedDescription !== (wedding.description ?? '')) patch.description = trimmedDescription || null;
    if (trimmedMuhurat !== (wedding.muhuratTimeLabel ?? '')) patch.muhuratTimeLabel = trimmedMuhurat || null;
    if (
      trimmedContactName !== (wedding.venueOpsContact?.name ?? '') ||
      trimmedContactPhone !== (wedding.venueOpsContact?.phoneNumber ?? '')
    ) {
      patch.venueOpsContact = trimmedContactName
        ? { name: trimmedContactName, phoneNumber: trimmedContactPhone }
        : null;
    }
    if (trimmedVenue !== wedding.location.formattedAddress) {
      patch.location = {
        formattedAddress: trimmedVenue,
        city: trimmedVenue,
        state: trimmedVenue,
        country: wedding.location.country,
      };
    }

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const updated = await weddingsApi.updateWedding(wedding.id, patch);
      onSaved(updated);
    } catch (error) {
      setErrorMessage(error instanceof ApiClientError ? error.displayMessage : 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormModal title="Edit wedding details" icon="edit" onClose={onClose} isBusy={isSaving}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p role="alert" className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Bride&apos;s Name *</span>
            <input
              required
              maxLength={200}
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Groom&apos;s Name *</span>
            <input
              required
              maxLength={200}
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Wedding Date *</span>
            <input
              type="date"
              required
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Time Zone</span>
            <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={INPUT_CLASS}>
              {timeZoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Muhurat Time</span>
          <input
            maxLength={50}
            placeholder="e.g. 06:42 PM"
            value={muhuratTimeLabel}
            onChange={(e) => setMuhuratTimeLabel(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Main Venue or Destination *</span>
          <input
            required
            maxLength={300}
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Venue Contact Name</span>
            <input
              maxLength={200}
              placeholder="e.g. Vikramaditya (Ops)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Venue Contact Phone</span>
            <input
              type="tel"
              maxLength={20}
              placeholder="e.g. +91 98765 43210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Total Estimated Budget (₹)</span>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="e.g. 6500000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Celebration Hashtag</span>
          <input
            maxLength={100}
            pattern="#?\w+"
            placeholder="e.g. AnanyaKabir2027"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Short Welcome Story</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${INPUT_CLASS} resize-none`}
          />
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-label-lg py-2.5 px-4 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold hover:bg-surface-container disabled:opacity-60 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="text-label-lg py-2.5 px-5 rounded-lg border-none bg-primary text-on-primary font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] hover:bg-primary-container active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
