'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { DashboardShell } from '../../../shared/components/layout/DashboardShell';
import styles from './dashboard.module.css';

interface ComingSoonSectionProps {
  title: string;
  description: string;
}

// Placeholder para las secciones del nav que todavía no tienen feature
// propia (Actividades, Semanal, Finanzas, Gastos, Peso, Ajustes). Mismo
// guard de auth que /dashboard -- se centraliza acá para no repetirlo en
// cada page.tsx. Cuando una sección se construya de verdad, su page.tsx deja
// de usar este componente y pasa a tener su propio feature (como metrics/).
export function ComingSoonSection({ title, description }: ComingSoonSectionProps) {
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
      <div className={styles.page}>
        <section className={styles.card}>
          <p className={styles.cardLabel}>{title}</p>
          <p className={styles.cardNote}>{description}</p>
        </section>
      </div>
    </DashboardShell>
  );
}
