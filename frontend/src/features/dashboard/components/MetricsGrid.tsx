import { MetricCard } from '../../../components/MetricCard';
import type { MetricCardEntry } from '../types';

interface MetricsGridProps {
  metrics: MetricCardEntry[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <section className="max-w-7xl mx-auto w-full px-gutter-mobile md:px-page-margin pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>
    </section>
  );
}
