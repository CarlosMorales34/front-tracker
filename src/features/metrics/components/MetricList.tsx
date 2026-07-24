'use client';

import { Metric } from '../types/metric.types';

interface MetricListProps {
  metrics: Metric[];
}

export function MetricList({ metrics }: MetricListProps) {
  if (metrics.length === 0) {
    return <p>Todavía no tienes métricas. Crea la primera.</p>;
  }

  return (
    <ul>
      {metrics.map((metric) => (
        <li key={metric.id}>
          {metric.name} <span>({metric.unit})</span>
        </li>
      ))}
    </ul>
  );
}
