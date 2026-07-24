'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { DashboardHome } from '../../features/dashboard/components/DashboardHome';
import { MOCK_DASHBOARD_DATA } from '../../features/dashboard/mocks/dashboard.mock';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';

// Home post-login. Igual que /metrics, redirige a /login si el refresh
// silencioso de sesión (ver AuthContext) no encuentra usuario.
export default function DashboardPage() {
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
      <DashboardHome name={user.name} data={MOCK_DASHBOARD_DATA} />
    </DashboardShell>
  );
}
