import { apiFetch } from '../../../shared/lib/api-client';
import { WeightGoalDirection, WeightMonthEntry, WeightSettings, WeightYearExtreme, WeightYearSummary } from '../types/weight.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const weightApi = {
  getYear: (year: number, accessToken?: string | null): Promise<WeightYearSummary> =>
    apiFetch<WeightYearSummary>(`/api/weight/years/${year}`, { headers: authHeaders(accessToken) }),

  setMonthValue: (
    year: number,
    month: number,
    value: number | null,
    accessToken?: string | null
  ): Promise<WeightMonthEntry> =>
    apiFetch<WeightMonthEntry>('/api/weight/months', {
      method: 'PUT',
      body: JSON.stringify({ year, month, value }),
      headers: authHeaders(accessToken),
    }),

  setMonthNote: (year: number, month: number, note: string, accessToken?: string | null): Promise<WeightMonthEntry> =>
    apiFetch<WeightMonthEntry>('/api/weight/months/note', {
      method: 'PUT',
      body: JSON.stringify({ year, month, note }),
      headers: authHeaders(accessToken),
    }),

  getSettings: (accessToken?: string | null): Promise<WeightSettings> =>
    apiFetch<WeightSettings>('/api/weight/settings', { headers: authHeaders(accessToken) }),

  updateSettings: (
    goalKg: number,
    goalDirection: WeightGoalDirection,
    accessToken?: string | null
  ): Promise<WeightSettings> =>
    apiFetch<WeightSettings>('/api/weight/settings', {
      method: 'PUT',
      body: JSON.stringify({ goalKg, goalDirection }),
      headers: authHeaders(accessToken),
    }),

  getYearlyExtremes: (accessToken?: string | null): Promise<WeightYearExtreme[]> =>
    apiFetch<WeightYearExtreme[]>('/api/weight/yearly-extremes', { headers: authHeaders(accessToken) }),
};
