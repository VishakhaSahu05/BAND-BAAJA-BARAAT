import { Icon } from './Icon';

/** Decorative marigold/Madhubani divider used between major dashboard sections. */
export function SectionDivider() {
  return (
    <div className="w-full flex items-center justify-center py-6 px-gutter-mobile md:px-page-margin max-w-7xl mx-auto">
      <div className="h-0.5 w-full bg-[linear-gradient(to_right,transparent,var(--color-primary-fixed-dim),transparent)]" />
      <div className="px-4 shrink-0 flex items-center justify-center">
        <Icon name="spa" filled className="text-[3rem]! text-primary-fixed-dim" />
      </div>
      <div className="h-0.5 w-full bg-[linear-gradient(to_right,transparent,var(--color-primary-fixed-dim),transparent)]" />
    </div>
  );
}
