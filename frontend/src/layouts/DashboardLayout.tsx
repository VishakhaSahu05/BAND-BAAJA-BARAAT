import type { ReactNode } from 'react';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';

interface DashboardLayoutProps {
  coupleName: string;
  hostRoleLabel: string;
  children: ReactNode;
}

/** Shared authenticated shell: fixed header + main content slot + footer. */
export function DashboardLayout({ coupleName, hostRoleLabel, children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <AppHeader coupleName={coupleName} hostRoleLabel={hostRoleLabel} />
      <main className="w-full pt-28 bg-surface">{children}</main>
      <AppFooter />
    </div>
  );
}
