export type MetricUnit = 'kg' | 'lb' | 'cm' | 'min' | 'reps' | 'count' | 'percent' | 'custom';

export interface Metric {
  id: string;
  name: string;
  unit: MetricUnit;
  createdAt: string;
}

export interface MetricEntry {
  id: string;
  metricId: string;
  value: number;
  note?: string;
  recordedAt: string;
}

export interface CreateMetricInput {
  name: string;
  unit: MetricUnit;
}
