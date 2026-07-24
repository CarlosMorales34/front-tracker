'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { DashboardHome } from '../../features/dashboard/components/DashboardHome';
import { homeApi } from '../../features/dashboard/services/home.api';
import { DashboardData } from '../../features/dashboard/types/dashboard.types';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';

// Home post-login. Igual que /metrics, redirige a /login si el refresh
// silencioso de sesión (ver AuthContext) no encuentra usuario.
export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      setData(await homeApi.getSummary(accessToken));
    } finally {
      setIsLoadingSummary(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) loadSummary();
  }, [user, loadSummary]);

  if (isAuthLoading || !user || isLoadingSummary || !data) {
    return (
      <DashboardShell>
        <p>Cargando…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHome name={user.name} data={data} />
    </DashboardShell>
  );
}
