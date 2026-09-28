export type MetricAccent = 'primary' | 'secondary' | 'tertiary' | 'neutral';

export interface MetricCardData {
  id: string;
  label: string;
  value: string;
  valueSuffix: string;
  badgeText: string;
  accent: MetricAccent;
  progressPercent: number;
}

const accentVar: Record<MetricAccent, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  neutral: 'var(--color-on-surface)',
};

const accentSoftVar: Record<MetricAccent, string> = {
  primary: 'var(--color-primary-soft)',
  secondary: 'var(--color-secondary-soft)',
  tertiary: 'var(--color-tertiary-soft)',
  neutral: 'var(--color-surface-container-high)',
};

/** Purely presentational — renders whatever `MetricCardData` it is given. */
export function MetricCard({ label, value, valueSuffix, badgeText, accent, progressPercent }: MetricCardData) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_10px_-2px_rgba(92,45,12,0.1)]">
      <div className="flex items-center justify-between pb-1">
        <span className="text-label-md text-on-surface-variant font-medium">{label}</span>
        <span
          className="text-label-sm px-2 py-0.5 rounded-full font-bold"
          style={{ background: accentSoftVar[accent], color: accentVar[accent] }}
        >
          {badgeText}
        </span>
      </div>
      <div className="flex items-baseline gap-1 py-1">
        <span className="text-headline-lg text-on-surface" style={{ color: accentVar[accent] }}>
          {value}
        </span>
        <span className="text-title-md text-on-surface-variant">{valueSuffix}</span>
      </div>
      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full"
          style={{ width: `${progressPercent}%`, background: accentVar[accent] }}
        />
      </div>
    </div>
  );
}
