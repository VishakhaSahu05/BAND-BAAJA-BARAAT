import { Icon } from '../../../components/Icon';
import type { CeremonyItineraryEntry } from '../types';
import { CeremonyCard } from './CeremonyCard';

interface CeremonyItinerarySectionProps {
  ceremonies: CeremonyItineraryEntry[];
}

export function CeremonyItinerarySection({ ceremonies }: CeremonyItinerarySectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 pb-1">
        <Icon name="calendar_month" filled className="text-primary text-2xl" />
        <h2 className="text-headline-md text-on-surface font-bold">Ceremonies &amp; Itinerary</h2>
      </div>
      <div className="flex flex-col gap-4">
        {ceremonies.map((ceremony) => (
          <CeremonyCard key={ceremony.id} ceremony={ceremony} />
        ))}
      </div>
    </div>
  );
}
