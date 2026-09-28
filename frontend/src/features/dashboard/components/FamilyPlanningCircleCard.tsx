import { Icon } from '../../../components/Icon';
import type { MetricAccent } from '../../../components/MetricCard';
import type { FamilyMemberEntry } from '../types';

const avatarBg: Record<MetricAccent, string> = {
  primary: 'var(--color-primary-fixed)',
  secondary: 'var(--color-secondary-fixed)',
  tertiary: 'var(--color-tertiary-fixed)',
  neutral: 'var(--color-surface-container-high)',
};

const avatarText: Record<MetricAccent, string> = {
  primary: 'var(--color-on-primary-fixed)',
  secondary: 'var(--color-on-secondary-fixed)',
  tertiary: 'var(--color-on-tertiary-fixed)',
  neutral: 'var(--color-on-surface)',
};

const badgeBg: Record<MetricAccent, string> = {
  primary: 'var(--color-primary-soft)',
  secondary: 'var(--color-secondary-soft)',
  tertiary: 'var(--color-tertiary-soft)',
  neutral: 'var(--color-surface-container-high)',
};

const badgeText: Record<MetricAccent, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  neutral: 'var(--color-on-surface)',
};

interface FamilyPlanningCircleCardProps {
  members: FamilyMemberEntry[];
}

/** "Sync" is a static/no-op affordance in this step — no messaging feature is implemented. */
export function FamilyPlanningCircleCard({ members }: FamilyPlanningCircleCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-1">
          <Icon name="groups" filled className="text-tertiary text-xl" />
          <h3 className="text-title-lg text-on-surface font-bold">Family Planning Circle</h3>
        </div>
        <button
          type="button"
          className="text-label-sm inline-flex items-center gap-1 bg-tertiary-soft text-tertiary border-none py-1 px-2 rounded-full font-semibold transition-colors duration-150 hover:bg-tertiary hover:text-on-tertiary"
        >
          <Icon name="chat" />
          <span>Sync</span>
        </button>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
              style={{ background: avatarBg[member.accent], color: avatarText[member.accent] }}
            >
              <span className="text-body-sm">{member.initials}</span>
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <p className="text-title-md text-on-surface whitespace-nowrap overflow-hidden text-ellipsis">
                {member.name}
              </p>
              <span
                className="text-label-sm py-0.5 px-2 rounded-full font-semibold shrink-0"
                style={{ background: badgeBg[member.accent], color: badgeText[member.accent] }}
              >
                {member.roleLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
