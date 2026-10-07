import { useCallback, useEffect, useState } from 'react';
import { getDashboardData } from '../api/dashboardApi';
import type { DashboardData } from '../types';

interface UseDashboardDataResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  /** Refetches in the background; the current data stays on screen until the new data arrives. */
  reload: () => void;
}

/** Loads the dashboard for `weddingId`; stays in the loading state until an id is available. */
export function useDashboardData(weddingId: string | null): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  useEffect(() => {
    if (!weddingId) {
      return;
    }

    let isMounted = true;
    setError(null);

    getDashboardData(weddingId)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError : new Error('Failed to load dashboard data'));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [weddingId, reloadCount]);

  return { data, isLoading, error, reload };
}
