import { apiFetch } from '../../../shared/lib/api-client';
import { PersonalAnalyticsSummary } from '../types/analytics.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const analyticsApi = {
  getPersonalSummary: (accessToken?: string | null, range?: { from?: string; to?: string }): Promise<PersonalAnalyticsSummary> => {
    const params = new URLSearchParams();
    if (range?.from) params.set('from', range.from);
    if (range?.to) params.set('to', range.to);
    const query = params.toString();
    return apiFetch<PersonalAnalyticsSummary>(`/api/analytics/personal-summary${query ? `?${query}` : ''}`, {
      headers: authHeaders(accessToken),
    });
  },
};
