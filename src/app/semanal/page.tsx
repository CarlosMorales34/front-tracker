'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { WeeklyLogView } from '../../features/weekly-log/components/WeeklyLogView';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';

export default function SemanalPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <DashboardShell>
        <p>Cargando…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <WeeklyLogView />
    </DashboardShell>
  );
}
