import { Icon } from '../../../components/Icon';
import type { MetricAccent } from '../../../components/MetricCard';
import type { CeremonyItineraryEntry } from '../types';

const accentColor: Record<MetricAccent, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  neutral: 'var(--color-on-surface)',
};

const accentOn: Record<MetricAccent, string> = {
  primary: 'var(--color-on-primary)',
  secondary: 'var(--color-on-secondary)',
  tertiary: 'var(--color-on-tertiary)',
  neutral: 'var(--color-surface)',
};

const accentSoft: Record<MetricAccent, string> = {
  primary: 'var(--color-primary-soft)',
  secondary: 'var(--color-secondary-soft)',
  tertiary: 'var(--color-tertiary-soft)',
  neutral: 'var(--color-surface-container-high)',
};

interface CeremonyCardProps {
  ceremony: CeremonyItineraryEntry;
}

export function CeremonyCard({ ceremony }: CeremonyCardProps) {
  const color = accentColor[ceremony.accent];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-[0_4px_10px_-2px_rgba(92,45,12,0.1)] sm:flex-row sm:h-56">
      <div className="relative h-44 overflow-hidden sm:w-2/5 sm:h-full">
        <img
          src={ceremony.imageSrc}
          alt={ceremony.imageAlt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <span
          className="text-label-sm absolute top-2 left-2 py-1 px-2.5 rounded-full uppercase tracking-wide font-bold shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
          style={{ background: color, color: accentOn[ceremony.accent] }}
        >
          {ceremony.ribbonLabel}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between gap-2 sm:w-3/5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-bold uppercase tracking-wider" style={{ color }}>
              {ceremony.timeLocationLabel}
            </span>
            {ceremony.metaBadgeLabel ? (
              <span
                className="text-label-sm"
                style={{
                  background: accentSoft[ceremony.accent],
                  color,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                {ceremony.metaBadgeLabel}
              </span>
            ) : (
              <Icon name="flare" filled style={{ color, fontSize: 16 }} />
            )}
          </div>
          <h3 className="text-headline-sm text-on-surface font-bold mt-1">{ceremony.name}</h3>
          <p className="text-body-sm text-on-surface-variant mt-1">{ceremony.description}</p>
        </div>
        <div className="pt-1 flex items-center justify-between">
          <span className="text-label-sm bg-surface-container-high text-on-surface-variant py-0.5 px-2 rounded">
            {ceremony.dressCode}
          </span>
          <button
            type="button"
            className="text-label-sm font-semibold bg-none border-none p-0 hover:underline"
            style={{ color }}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
