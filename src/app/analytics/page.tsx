'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AnalyticsView } from '../../features/analytics/components/AnalyticsView';
import { analyticsApi } from '../../features/analytics/services/analytics.api';
import { PersonalAnalyticsSummary } from '../../features/analytics/types/analytics.types';
import { useAuth } from '../../features/auth/context/AuthContext';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const [range, setRange] = useState<'30d' | '90d'>('90d');
  const [summary, setSummary] = useState<PersonalAnalyticsSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    setIsLoadingSummary(true);
    try {
      setSummary(await analyticsApi.getPersonalSummary(accessToken, buildRange(range)));
    } finally {
      setIsLoadingSummary(false);
    }
  }, [accessToken, range, user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (isAuthLoading || !user || isLoadingSummary || !summary) {
    return (
      <DashboardShell>
        <Spinner />
      </DashboardShell>
    );
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
  return date.toISOString().slice(0, 10);
}
