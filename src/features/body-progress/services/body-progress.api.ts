import { apiFetch } from '../../../shared/lib/api-client';
import {
  BodyGoal,
  BodyMeasurement,
  BodyProgressSummary,
  CreateMeasurementInput,
  SetGoalInput,
  UpdateMeasurementInput,
} from '../types/body-progress.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const bodyProgressApi = {
  getSummary: (accessToken?: string | null): Promise<BodyProgressSummary> =>
    apiFetch<BodyProgressSummary>('/api/body-measurements/summary', { headers: authHeaders(accessToken) }),

  listMeasurements: (from: string, to: string, accessToken?: string | null): Promise<BodyMeasurement[]> =>
    apiFetch<BodyMeasurement[]>(`/api/body-measurements?from=${from}&to=${to}`, {
      headers: authHeaders(accessToken),
    }),

  createMeasurement: (input: CreateMeasurementInput, accessToken?: string | null): Promise<BodyMeasurement> =>
    apiFetch<BodyMeasurement>('/api/body-measurements', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  updateMeasurement: (
    id: string,
    input: UpdateMeasurementInput,
    accessToken?: string | null,
  ): Promise<BodyMeasurement> =>
    apiFetch<BodyMeasurement>(`/api/body-measurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  deleteMeasurement: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/body-measurements/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  setGoal: (input: SetGoalInput, accessToken?: string | null): Promise<BodyGoal> =>
    apiFetch<BodyGoal>('/api/body-goals', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  getGoalHistory: (accessToken?: string | null): Promise<BodyGoal[]> =>
    apiFetch<BodyGoal[]>('/api/body-goals/history', { headers: authHeaders(accessToken) }),
};
