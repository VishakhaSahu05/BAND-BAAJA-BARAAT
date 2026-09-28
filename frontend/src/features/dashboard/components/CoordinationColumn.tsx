import type { CriticalTaskEntry, FamilyMemberEntry, VenueSummary } from '../types';
import { CriticalTasksCard } from './CriticalTasksCard';
import { FamilyPlanningCircleCard } from './FamilyPlanningCircleCard';
import { VenueInfoCard } from './VenueInfoCard';

interface CoordinationColumnProps {
  tasks: CriticalTaskEntry[];
  familyCircle: FamilyMemberEntry[];
  venue: VenueSummary;
}

/** Right-hand column: coordination & concierge cards, stacked with consistent spacing. */
export function CoordinationColumn({ tasks, familyCircle, venue }: CoordinationColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <CriticalTasksCard tasks={tasks} />
      <FamilyPlanningCircleCard members={familyCircle} />
      <VenueInfoCard venue={venue} />
    </div>
  );
}
