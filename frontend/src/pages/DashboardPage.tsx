import { SectionDivider } from '../components/SectionDivider';
import { DashboardMainSection } from '../features/dashboard/components/DashboardMainSection';
import { HeroSection } from '../features/dashboard/components/HeroSection';
import { MetricsGrid } from '../features/dashboard/components/MetricsGrid';
import { SanskritQuoteBanner } from '../features/dashboard/components/SanskritQuoteBanner';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardLayout } from '../layouts/DashboardLayout';

/** Route-level "Wedding Overview & Dashboard" page — composes the dashboard feature's sections. */
export function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-on-surface-variant">
        <p className="text-body-md">{error ? 'Unable to load the dashboard.' : 'Loading your celebration…'}</p>
      </div>
    );
  }

  return (
    <DashboardLayout coupleName={data.wedding.coupleName} hostRoleLabel={data.wedding.hostRoleLabel}>
      <HeroSection wedding={data.wedding} countdown={data.countdown} />
      <SectionDivider />
      <MetricsGrid metrics={data.metrics} />
      <DashboardMainSection
        ceremonies={data.ceremonies}
        criticalTasks={data.criticalTasks}
        familyCircle={data.familyCircle}
        venue={data.venue}
      />
      <SanskritQuoteBanner quote={data.quote} />
    </DashboardLayout>
  );
}
