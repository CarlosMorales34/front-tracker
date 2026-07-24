import { apiFetch } from '../../../shared/lib/api-client';
import { CreateMetricInput, Metric, MetricEntry } from '../types/metric.types';

// Agrega el Authorization Bearer cuando hay accessToken disponible. El
// token vive en memoria en AuthContext (no localStorage) y se pasa acá como
// parámetro explícito en vez de que este servicio dependa del contexto de
// React directamente, para mantenerlo desacoplado de la capa de UI.
function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const metricsApi = {
  list: (accessToken?: string | null): Promise<Metric[]> =>
    apiFetch<Metric[]>('/api/metrics', { headers: authHeaders(accessToken) }),

  create: (input: CreateMetricInput, accessToken?: string | null): Promise<Metric> =>
    apiFetch<Metric>('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  history: (metricId: string, accessToken?: string | null): Promise<MetricEntry[]> =>
    apiFetch<MetricEntry[]>(`/api/metric-entries/${metricId}`, { headers: authHeaders(accessToken) }),

  logEntry: (
    metricId: string,
    value: number,
    note?: string,
    accessToken?: string | null
  ): Promise<MetricEntry> =>
    apiFetch<MetricEntry>('/api/metric-entries', {
      method: 'POST',
      body: JSON.stringify({ metricId, value, note }),
      headers: authHeaders(accessToken),
    }),
};
