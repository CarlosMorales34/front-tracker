'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { ActivitiesView } from '../../features/activities/components/ActivitiesView';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';

export default function ActividadesPage() {
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
      <ActivitiesView />
    </DashboardShell>
  );
}
