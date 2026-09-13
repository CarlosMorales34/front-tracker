'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { PatrimonioView } from '../../../features/finance/components/PatrimonioView';
import { DashboardShell } from '../../../shared/components/layout/DashboardShell';
import { Spinner } from '../../../shared/components/ui/Spinner';

export default function FinanzasPatrimonioPage() {
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
      <PatrimonioView />
    </DashboardShell>
  );
}
