import { Icon } from '../../../components/Icon';
import type { CeremonyItineraryEntry } from '../types';
import { CeremonyCard } from './CeremonyCard';

interface CeremonyItinerarySectionProps {
  ceremonies: CeremonyItineraryEntry[];
  onAddCeremony: () => void;
  onEditCeremony: (ceremonyId: string) => void;
}

export function CeremonyItinerarySection({ ceremonies, onAddCeremony, onEditCeremony }: CeremonyItinerarySectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-1">
          <Icon name="calendar_month" filled className="text-primary text-2xl" />
          <h2 className="text-headline-md text-on-surface font-bold">Ceremonies &amp; Itinerary</h2>
        </div>
        <button
          type="button"
          onClick={onAddCeremony}
          className="text-label-md inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary font-semibold transition-colors duration-150 hover:border-primary"
        >
          <Icon name="add" style={{ fontSize: 16 }} />
          Add Ceremony
        </button>
      </div>
      {ceremonies.length === 0 ? (
        <p className="text-body-md text-on-surface-variant bg-surface-container-lowest rounded-xl p-6 text-center">
          No ceremonies yet. Add your first one to start building the itinerary.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {ceremonies.map((ceremony) => (
            <CeremonyCard key={ceremony.id} ceremony={ceremony} onEdit={() => onEditCeremony(ceremony.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
