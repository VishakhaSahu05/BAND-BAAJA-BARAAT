import { Icon } from '../../../components/Icon';
import type { VenueSummary } from '../types';

interface VenueInfoCardProps {
  venue: VenueSummary;
}

export function VenueInfoCard({ venue }: VenueInfoCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between pb-1">
        <span className="text-label-sm text-primary font-bold uppercase tracking-wider">Venue Headquarters</span>
        <Icon name="location_city" className="text-tertiary text-lg" />
      </div>
      <h3 className="text-headline-sm text-on-surface font-bold">{venue.name}</h3>
      <p className="text-body-sm text-on-surface-variant mt-0.5">{venue.detailLine}</p>
      <div className="mt-4 flex items-center justify-between pt-1">
        <div className="text-body-sm flex items-center gap-1 text-on-surface-variant">
          <Icon name="support_agent" className="text-primary text-base" />
          <span>{venue.opsContactName}</span>
        </div>
        <a
          href={`tel:${venue.phoneNumber}`}
          className="text-label-sm bg-tertiary text-on-tertiary py-1.5 px-4 rounded-lg font-semibold transition-colors duration-150 hover:bg-tertiary-container"
        >
          Call Concierge
        </a>
      </div>
    </div>
  );
}
