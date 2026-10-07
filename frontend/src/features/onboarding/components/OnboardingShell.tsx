import type { ReactNode } from 'react';
import emblemSrc from '../../../assets/emblem-icon.jpg';
import { Icon } from '../../../components/Icon';

interface OnboardingShellProps {
  badgeLabel?: string;
  icon: string;
  title: string;
  subtitle: string;
  step: 1 | 2 | 3;
  children: ReactNode;
}

/** Shared chrome for the onboarding wizard's three steps: emblem, badge, title, progress bar, footer shloka. */
export function OnboardingShell({ badgeLabel, icon, title, subtitle, step, children }: OnboardingShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-gutter-mobile py-10">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(50,10,15,0.15)] border border-[rgba(143,112,102,0.15)] p-8">
        <div className="flex flex-col items-center text-center gap-1">
          <div className="h-16 w-16 overflow-hidden rounded-full">
            <img
              src={emblemSrc}
              alt="Band Baaja Baaraat Emblem"
              className="h-full w-full scale-150 object-cover object-[50%_38%]"
            />
          </div>
          {badgeLabel ? (
            <span className="text-label-sm inline-flex items-center gap-1 bg-primary-soft text-primary py-1 px-3 rounded-full uppercase tracking-wide font-bold mt-2">
              <Icon name="auto_awesome" style={{ fontSize: 12 }} />
              {badgeLabel}
            </span>
          ) : (
            <span className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wide mt-2">
              Step {step} of 3
            </span>
          )}
          <h1 className="text-title-lg text-on-surface font-bold mt-2 flex items-center gap-1.5">
            {title}
            <Icon name={icon} filled className="text-primary" style={{ fontSize: 20 }} />
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-sm">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex-1 h-1.5 rounded-full ${stepNumber <= step ? 'bg-primary' : 'bg-surface-container-high'}`}
            />
          ))}
          <span className="text-label-sm text-on-surface-variant font-semibold whitespace-nowrap">
            STEP {step} OF 3
          </span>
        </div>

        {children}

        <p className="text-headline-sm text-secondary italic tracking-wide text-center mt-6">
          &ldquo;शुभ विवाह • मङ्गलम् भगवान् विष्णु: मङ्गलम् गरुडध्वजः&rdquo;
        </p>
      </div>
    </div>
  );
}
