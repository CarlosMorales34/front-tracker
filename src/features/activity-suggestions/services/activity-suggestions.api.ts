import { apiFetch } from '../../../shared/lib/api-client';
import { AcceptSuggestionInput, ActivitySuggestion, UserSuggestionSettings } from '../types/activity-suggestions.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Único punto de contacto del front con el motor de sugerencias -- ninguna
// vista debe calcular patrones ni tocar el detector directo, solo consumir
// estos endpoints (ver activity-pattern-calculations.ts en el backend).
export const activitySuggestionsApi = {
  generate: (accessToken?: string | null): Promise<ActivitySuggestion[]> =>
    apiFetch<ActivitySuggestion[]>('/api/activity-suggestions/generate', {
      method: 'POST',
      headers: authHeaders(accessToken),
    }),

  listPending: (accessToken?: string | null): Promise<ActivitySuggestion[]> =>
    apiFetch<ActivitySuggestion[]>('/api/activity-suggestions', { headers: authHeaders(accessToken) }),

  accept: (id: string, input: AcceptSuggestionInput, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/activity-suggestions/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  dismiss: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/activity-suggestions/${id}/dismiss`, { method: 'POST', headers: authHeaders(accessToken) }),

  clearHistory: (accessToken?: string | null): Promise<void> =>
    apiFetch<void>('/api/activity-suggestions', { method: 'DELETE', headers: authHeaders(accessToken) }),

  getSettings: (accessToken?: string | null): Promise<UserSuggestionSettings> =>
    apiFetch<UserSuggestionSettings>('/api/activity-suggestions/settings', { headers: authHeaders(accessToken) }),

  updateSettings: (settings: UserSuggestionSettings, accessToken?: string | null): Promise<UserSuggestionSettings> =>
    apiFetch<UserSuggestionSettings>('/api/activity-suggestions/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
      headers: authHeaders(accessToken),
    }),
};
