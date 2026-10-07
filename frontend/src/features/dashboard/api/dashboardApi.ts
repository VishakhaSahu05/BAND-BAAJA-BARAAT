import { apiRequest } from '../../../services/apiClient';
import type { DashboardData, ShlokaQuote } from '../types';

const DASHBOARD_QUOTE: ShlokaQuote = {
  text: '"माङ्गल्यं तन्तुनानेन मम जीवनहेतुना । कण्ठे बध्नामि सुभगे सञ्जीव शरदः शतम् ॥"',
  attribution: 'Shubh Vivaah',
};

export async function getDashboardData(weddingId: string): Promise<DashboardData> {
  const response = await apiRequest<Omit<DashboardData, 'quote'>>(
    `/weddings/${encodeURIComponent(weddingId)}/dashboard`,
  );
  return { ...response, quote: DASHBOARD_QUOTE };
}
