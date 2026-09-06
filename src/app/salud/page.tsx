'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { HealthSummaryView } from '../../features/health-summary/components/HealthSummaryView';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { HealthTabs } from '../../shared/components/layout/HealthTabs';
import { Spinner } from '../../shared/components/ui/Spinner';
import uiStyles from '../../shared/components/ui/ui.module.css';

export default function SaludPage() {
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
        <Spinner />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className={uiStyles.page}>
        <div className={uiStyles.pageHeader}>
          <div>
            <h1 className={uiStyles.pageTitle}>Salud</h1>
            <p className={uiStyles.pageSubtitle}>Progreso corporal y entrenamientos</p>
          </div>
        </div>
        <HealthTabs />
        <HealthSummaryView />
      </div>
    </DashboardShell>
  );
}
