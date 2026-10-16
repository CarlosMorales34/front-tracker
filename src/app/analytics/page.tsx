'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalyticsView } from '../../features/analytics/components/AnalyticsView';
import { analyticsApi } from '../../features/analytics/services/analytics.api';
import { PersonalAnalyticsSummary } from '../../features/analytics/types/analytics.types';
import { useAuth } from '../../features/auth/context/AuthContext';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const [range, setRange] = useState<'30d' | '90d'>('30d');
  const [summary, setSummary] = useState<PersonalAnalyticsSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const id = ++requestId.current;
    setIsLoadingSummary(true);
    setError(null);
    try {
      const result = await analyticsApi.getPersonalSummary(accessToken, buildRange(range));
      if (id === requestId.current) setSummary(result);
    } catch {
      if (id === requestId.current) setError('No se pudieron cargar tus registros.');
    } finally {
      if (id === requestId.current) setIsLoadingSummary(false);
    }
  }, [accessToken, range, user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (isAuthLoading || !user || isLoadingSummary) {
    return (
      <DashboardShell>
        <Spinner />
      </DashboardShell>
    );
  }

  if (error || !summary) {
    return <DashboardShell><p role="alert">{error ?? 'No hay información disponible.'}</p><button type="button" onClick={loadSummary}>Reintentar</button></DashboardShell>;
  }

  return (
    <DashboardShell>
      <AnalyticsView summary={summary} range={range} onRangeChange={setRange} />
    </DashboardShell>
  );
}

function buildRange(range: '30d' | '90d'): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime());
  from.setDate(from.getDate() - (range === '30d' ? 29 : 89));
  return { from: toDateOnly(from), to: toDateOnly(to) };
}

function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
