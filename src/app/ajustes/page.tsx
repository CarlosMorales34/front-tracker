'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useOnboarding } from '../../features/onboarding/OnboardingProvider';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';
import uiStyles from '../../shared/components/ui/ui.module.css';
import dashboardStyles from '../../features/dashboard/components/dashboard.module.css';

export default function AjustesPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { restart } = useOnboarding();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <DashboardShell>
        <Spinner />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className={dashboardStyles.page}>
        <section className={dashboardStyles.card}>
          <p className={dashboardStyles.cardLabel}>Ajustes</p>
          <p className={dashboardStyles.cardNote}>Todavía no está conectada. Se irá llenando conforme construyamos esta sección.</p>
        </section>
        <section className={dashboardStyles.card}>
          <p className={dashboardStyles.cardLabel}>Recorrido de bienvenida</p>
          <p className={dashboardStyles.cardNote}>Vuelve a ver la explicación guiada de cómo funciona cada sección de la app.</p>
          <button
            type="button"
            className={uiStyles.outlineButton}
            data-tour="onboarding-restart"
            onClick={restart}
            style={{ marginTop: '0.7rem' }}
          >
            Reiniciar recorrido
          </button>
        </section>
      </div>
    </DashboardShell>
  );
}
