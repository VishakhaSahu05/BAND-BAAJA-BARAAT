import { useCountdown } from '../hooks/useCountdown';
import { Icon } from './Icon';

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export interface CountdownTimerProps {
  targetDate: Date;
  muhuratTimeLabel?: string;
}

/**
 * Presentational countdown card. Ticks locally via `useCountdown`; all
 * wedding-specific copy (muhurat label, sync status) is passed in as props.
 */
export function CountdownTimer({ targetDate, muhuratTimeLabel }: CountdownTimerProps) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_14px_-4px_rgba(92,45,12,0.12)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))]" />
      <div className="flex items-center justify-between pb-2">
        <span className="text-label-md text-on-surface-variant">Countdown to Muhurat</span>
        <span className="text-label-sm bg-primary-soft text-primary px-2.5 py-0.5 rounded-full font-bold">
          {days} Days to go
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center py-2">
        <div className="bg-surface-container p-2 rounded-lg flex flex-col items-center justify-center">
          <span className="text-display-md text-primary font-bold">{days}</span>
          <span className="text-label-sm text-on-surface-variant">Days</span>
        </div>
        <div className="bg-surface-container p-2 rounded-lg flex flex-col items-center justify-center">
          <span className="text-display-md text-primary font-bold">{pad(hours)}</span>
          <span className="text-label-sm text-on-surface-variant">Hours</span>
        </div>
        <div className="bg-surface-container p-2 rounded-lg flex flex-col items-center justify-center">
          <span className="text-display-md text-primary font-bold">{pad(minutes)}</span>
          <span className="text-label-sm text-on-surface-variant">Mins</span>
        </div>
        <div className="bg-surface-container p-2 rounded-lg flex flex-col items-center justify-center">
          <span className="text-display-md text-secondary font-bold">{pad(seconds)}</span>
          <span className="text-label-sm text-on-surface-variant">Secs</span>
        </div>
      </div>
      <div className="mt-4 pt-1 flex items-center justify-between text-on-surface-variant">
        <div className="flex items-center gap-1">
          <Icon name="verified" className="text-secondary text-base" />
          <span className="text-label-md text-on-surface">
            {muhuratTimeLabel ? `Vedic Lagna • ${muhuratTimeLabel}` : 'Muhurat not set yet'}
          </span>
        </div>
        <span className="text-label-sm text-tertiary font-bold tracking-wide">Synchronized</span>
      </div>
    </div>
  );
}
