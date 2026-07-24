import { apiFetch } from '../../../shared/lib/api-client';
import { CreateMetricInput, Metric, MetricEntry } from '../types/metric.types';

export const metricsApi = {
  list: (): Promise<Metric[]> => apiFetch<Metric[]>('/api/metrics'),

  create: (input: CreateMetricInput): Promise<Metric> =>
    apiFetch<Metric>('/api/metrics', { method: 'POST', body: JSON.stringify(input) }),

  history: (metricId: string): Promise<MetricEntry[]> =>
    apiFetch<MetricEntry[]>(`/api/metric-entries/${metricId}`),

  logEntry: (metricId: string, value: number, note?: string): Promise<MetricEntry> =>
    apiFetch<MetricEntry>('/api/metric-entries', {
      method: 'POST',
      body: JSON.stringify({ metricId, value, note }),
    }),
};
