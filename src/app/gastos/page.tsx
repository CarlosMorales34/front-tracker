'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { ExpensesView } from '../../features/expenses/components/ExpensesView';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';

export default function GastosPage() {
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
      <ExpensesView />
    </DashboardShell>
  );
}
