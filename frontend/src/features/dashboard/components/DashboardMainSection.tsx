import type { CeremonyItineraryEntry, CriticalTaskEntry, FamilyMemberEntry, VenueSummary } from '../types';
import { CeremonyItinerarySection } from './CeremonyItinerarySection';
import { CoordinationColumn } from './CoordinationColumn';

interface DashboardMainSectionProps {
  ceremonies: CeremonyItineraryEntry[];
  criticalTasks: CriticalTaskEntry[];
  familyCircle: FamilyMemberEntry[];
  venue: VenueSummary;
}

/** The two-column body: ceremonies/itinerary (7 cols) and coordination/concierge (5 cols). */
export function DashboardMainSection({ ceremonies, criticalTasks, familyCircle, venue }: DashboardMainSectionProps) {
  return (
    <section className="max-w-7xl mx-auto w-full px-gutter-mobile md:px-page-margin pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="min-w-0 lg:col-span-7">
          <CeremonyItinerarySection ceremonies={ceremonies} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <CoordinationColumn tasks={criticalTasks} familyCircle={familyCircle} venue={venue} />
        </div>
      </div>
    </section>
  );
}
