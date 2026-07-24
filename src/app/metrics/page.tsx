'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '../../shared/components/layout/AppShell';
import { MetricForm } from '../../features/metrics/components/MetricForm';
import { MetricList } from '../../features/metrics/components/MetricList';
import { metricsApi } from '../../features/metrics/services/metrics.api';
import { CreateMetricInput, Metric } from '../../features/metrics/types/metric.types';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      setMetrics(await metricsApi.list());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleCreate = async (input: CreateMetricInput) => {
    await metricsApi.create(input);
    await loadMetrics();
  };

  return (
    <AppShell>
      <MetricForm onSubmit={handleCreate} />
      {isLoading ? <p>Cargando…</p> : <MetricList metrics={metrics} />}
    </AppShell>
  );
}
