import { useEffect, useState } from 'react';
import { getDashboardData } from '../api/dashboardApi';
import type { DashboardData } from '../types';

interface UseDashboardDataResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Loads dashboard data through the same async shape a real API-backed hook
 * will use later (`{ data, isLoading, error }`), even though today's source
 * is mock data resolved instantly. Components should depend on this hook,
 * not on `mockData.ts` or `dashboardApi.ts` directly.
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDashboardData()
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
  }, []);

  return { data, isLoading, error };
}
