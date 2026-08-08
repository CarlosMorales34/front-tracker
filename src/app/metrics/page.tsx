'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { MetricForm } from '../../features/metrics/components/MetricForm';
import { MetricList } from '../../features/metrics/components/MetricList';
import { metricsApi } from '../../features/metrics/services/metrics.api';
import { CreateMetricInput, Metric } from '../../features/metrics/types/metric.types';
import { AppShell } from '../../shared/components/layout/AppShell';
import { Spinner } from '../../shared/components/ui/Spinner';

export default function MetricsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Solo redirige cuando el intento de refresh silencioso (ver AuthContext)
  // ya terminó y no hay sesión -- redirigir mientras isAuthLoading es true
  // mandaría a /login a usuarios con sesión válida por cookie.
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      setMetrics(await metricsApi.list(accessToken));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user, loadMetrics]);

  const handleCreate = async (input: CreateMetricInput) => {
    await metricsApi.create(input, accessToken);
    await loadMetrics();
  };

  if (isAuthLoading || !user) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <MetricForm onSubmit={handleCreate} />
      {isLoading ? <Spinner /> : <MetricList metrics={metrics} />}
    </AppShell>
  );
}
