import { CountdownTimer } from '../../../components/CountdownTimer';
import { Icon } from '../../../components/Icon';
import type { CountdownSummary, WeddingSummary } from '../types';

interface HeroSectionProps {
  wedding: WeddingSummary;
  countdown: CountdownSummary;
}

export function HeroSection({ wedding, countdown }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-surface-container-low pt-8 px-gutter-mobile md:px-page-margin pb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-soft blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-secondary-soft blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="flex flex-col justify-center gap-4 py-2 lg:col-span-7">
            <div className="text-label-sm inline-flex items-center gap-1 bg-primary-soft text-primary py-1 px-4 rounded-full uppercase tracking-[0.08em] font-bold w-fit">
              <Icon name="stars" />
              <span>{wedding.eventLabel}</span>
            </div>
            <div>
              <h1 className="text-display-md text-on-surface font-bold leading-[1.15]">
                {wedding.coupleName}&apos;s Wedding Celebration
              </h1>
              <p className="text-body-lg text-on-surface-variant mt-1 max-w-xl">{wedding.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-1 bg-surface-container-lowest py-1.5 px-4 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <Icon name="location_on" className="text-primary text-lg" />
                <span className="text-label-md text-on-surface font-semibold">{wedding.venueLine}</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest py-1.5 px-4 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <Icon name="event" className="text-secondary text-lg" />
                <span className="text-label-md text-on-surface font-semibold">{wedding.scheduleLine}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:col-span-5">
            <CountdownTimer
              targetDate={new Date(countdown.targetDateIso)}
              muhuratTimeLabel={countdown.muhuratTimeLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
