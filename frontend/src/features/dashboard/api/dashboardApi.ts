import { mockDashboardData } from '../mockData';
import type { DashboardData } from '../types';

/**
 * Stand-in for a future call to `GET /weddings/:weddingId/dashboard`
 * (REST API Design doc §17). No network/backend code runs in this step —
 * this resolves with isolated mock data so the rest of the feature can be
 * written against a `Promise<DashboardData>` contract and swapped over
 * later without touching any component.
 */
export function getDashboardData(): Promise<DashboardData> {
  return Promise.resolve(mockDashboardData);
}
