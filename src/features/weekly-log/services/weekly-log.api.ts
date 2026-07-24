import { apiFetch } from '../../../shared/lib/api-client';
import { AnnualCounter, AnnualProductivitySummary, WeekDetail } from '../types/weekly-log.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const weeklyLogApi = {
  getYear: (year: number, accessToken?: string | null): Promise<AnnualProductivitySummary> =>
    apiFetch<AnnualProductivitySummary>(`/api/weekly-log/years/${year}`, { headers: authHeaders(accessToken) }),

  getWeek: (year: number, weekNumber: number, accessToken?: string | null): Promise<WeekDetail> =>
    apiFetch<WeekDetail>(`/api/weekly-log/weeks/${year}/${weekNumber}`, { headers: authHeaders(accessToken) }),

  setWeekNotes: (
    year: number,
    weekNumber: number,
    notes: string,
    accessToken?: string | null
  ): Promise<{ notes: string }> =>
    apiFetch<{ notes: string }>(`/api/weekly-log/weeks/${year}/${weekNumber}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
      headers: authHeaders(accessToken),
    }),

  listCounters: (year: number, accessToken?: string | null): Promise<AnnualCounter[]> =>
    apiFetch<AnnualCounter[]>(`/api/weekly-log/counters?year=${year}`, { headers: authHeaders(accessToken) }),

  createCounter: async (
    name: string,
    year: number,
    value: number,
    accessToken?: string | null
  ): Promise<AnnualCounter> => {
    // El POST no calcula previousYearValue (solo el GET de listado lo hace
    // con un lookup extra) -- sin este default queda `undefined`, que no es
    // lo mismo que `null` para el chequeo "no hay dato del año anterior".
    const created = await apiFetch<Omit<AnnualCounter, 'previousYearValue'>>('/api/weekly-log/counters', {
      method: 'POST',
      body: JSON.stringify({ name, year, value }),
      headers: authHeaders(accessToken),
    });
    return { ...created, previousYearValue: null };
  },

  deleteCounter: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/weekly-log/counters/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),
};
