import type { ShlokaQuote } from '../types';

interface SanskritQuoteBannerProps {
  quote: ShlokaQuote;
}

/**
 * The source Stitch HTML wraps this quote in a leftover 4-column grid class
 * (reused from the metrics section) that has no real layout effect with only
 * two lines of content — that looks like a generation artifact rather than
 * an intentional 4-column quote layout, so this is implemented as a simple
 * centered quote block instead of replicating that class literally.
 */
export function SanskritQuoteBanner({ quote }: SanskritQuoteBannerProps) {
  return (
    <section className="max-w-7xl mx-auto w-full px-gutter-mobile md:px-page-margin pb-6 text-center">
      <p className="text-headline-sm text-secondary italic tracking-wide">{quote.text}</p>
      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{quote.attribution}</p>
    </section>
  );
}
