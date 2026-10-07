import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionDivider } from '../components/SectionDivider';
import { useAuth } from '../features/auth/AuthContext';
import { DashboardMainSection } from '../features/dashboard/components/DashboardMainSection';
import { EditCeremonyModal } from '../features/dashboard/components/EditCeremonyModal';
import { EditWeddingModal } from '../features/dashboard/components/EditWeddingModal';
import { HeroSection } from '../features/dashboard/components/HeroSection';
import { MetricsGrid } from '../features/dashboard/components/MetricsGrid';
import { SanskritQuoteBanner } from '../features/dashboard/components/SanskritQuoteBanner';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ApiClientError } from '../services/apiClient';
import * as weddingsApi from '../services/weddingsApi';
import type { Wedding } from '../services/weddingsApi';

type CeremonyEditor = { open: false } | { open: true; eventId: string | null };

/** Route-level "Wedding Overview & Dashboard" page — composes the dashboard feature's sections. */
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [weddingError, setWeddingError] = useState(false);
  const [isEditingWedding, setIsEditingWedding] = useState(false);
  const [ceremonyEditor, setCeremonyEditor] = useState<CeremonyEditor>({ open: false });
  const { data, isLoading, error, reload } = useDashboardData(wedding?.id ?? null);

  useEffect(() => {
    let cancelled = false;

    weddingsApi
      .getCurrentWedding()
      .then((currentWedding) => {
        if (!cancelled) {
          setWedding(currentWedding);
        }
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        if (caughtError instanceof ApiClientError && caughtError.status === 404) {
          navigate('/onboarding', { replace: true });
          return;
        }
        setWeddingError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const closeWeddingEditor = useCallback(() => setIsEditingWedding(false), []);
  const closeCeremonyEditor = useCallback(() => setCeremonyEditor({ open: false }), []);

  function handleWeddingSaved(updated: Wedding) {
    setWedding(updated);
    setIsEditingWedding(false);
    reload();
  }

  function handleCeremonySaved() {
    setCeremonyEditor({ open: false });
    reload();
  }

  if (weddingError || (error && !data)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-on-surface-variant">
        <p role="alert" className="text-body-md">
          Unable to load the dashboard.
        </p>
      </div>
    );
  }

  if (isLoading || !data || !user || !wedding) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-on-surface-variant">
        <p className="text-body-md">Loading your celebration…</p>
      </div>
    );
  }

  return (
    <DashboardLayout coupleName={user.name} hostRoleLabel="Host Account">
      {error ? (
        <div className="px-gutter-mobile md:px-page-margin pt-2">
          <div
            role="alert"
            className="max-w-7xl mx-auto flex items-center justify-between gap-3 rounded-lg bg-error-container text-on-error-container px-4 py-2 text-body-sm"
          >
            <span>Couldn&apos;t refresh the dashboard — showing the last loaded data.</span>
            <button
              type="button"
              onClick={reload}
              className="text-label-md font-semibold bg-transparent border border-current rounded-lg px-3 py-1"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}
      <HeroSection wedding={data.wedding} countdown={data.countdown} onEdit={() => setIsEditingWedding(true)} />
      <SectionDivider />
      <MetricsGrid metrics={data.metrics} />
      <DashboardMainSection
        ceremonies={data.ceremonies}
        criticalTasks={data.criticalTasks}
        familyCircle={data.familyCircle}
        venue={data.venue}
        onAddCeremony={() => setCeremonyEditor({ open: true, eventId: null })}
        onEditCeremony={(eventId) => setCeremonyEditor({ open: true, eventId })}
      />
      <SanskritQuoteBanner quote={data.quote} />

      {isEditingWedding ? (
        <EditWeddingModal wedding={wedding} onClose={closeWeddingEditor} onSaved={handleWeddingSaved} />
      ) : null}
      {ceremonyEditor.open ? (
        <EditCeremonyModal
          weddingId={wedding.id}
          eventId={ceremonyEditor.eventId}
          defaultDate={wedding.weddingDate.slice(0, 10)}
          timeZone={wedding.timeZone}
          onClose={closeCeremonyEditor}
          onSaved={handleCeremonySaved}
        />
      ) : null}
    </DashboardLayout>
  );
}
