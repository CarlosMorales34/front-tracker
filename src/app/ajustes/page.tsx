'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { UserModules } from '../../features/auth/types/auth.types';
import { useOnboarding } from '../../features/onboarding/OnboardingProvider';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';
import uiStyles from '../../shared/components/ui/ui.module.css';
import dashboardStyles from '../../features/dashboard/components/dashboard.module.css';

// Mismo criterio de agrupación que Sidebar/BottomTabBar (ver nav-items.ts):
// Actividades incluye Registro semanal, Finanzas incluye Gastos, Salud es
// Peso/Entrenamientos.
const MODULE_OPTIONS: { key: keyof UserModules; label: string }[] = [
  { key: 'hasActivities', label: 'Actividades diarias y Registro semanal' },
  { key: 'hasFinance', label: 'Finanzas y Gastos diarios' },
  { key: 'hasHealth', label: 'Peso y Entrenamientos' },
];

function ModulesSection() {
  const { modules, updateModules } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!modules) return null;

  const toggle = async (key: keyof UserModules) => {
    const next = { ...modules, [key]: !modules[key] };
    if (!next.hasActivities && !next.hasFinance && !next.hasHealth) {
      setError('Debes tener al menos un dominio habilitado.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateModules(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={dashboardStyles.card}>
      <p className={dashboardStyles.cardLabel}>Dominios habilitados</p>
      <p className={dashboardStyles.cardNote} style={{ marginBottom: '0.7rem' }}>
        Elige qué partes de la app quieres ver en la navegación.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {MODULE_OPTIONS.map((option) => (
          <label
            key={option.key}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={modules[option.key]}
              disabled={isSaving}
              onChange={() => toggle(option.key)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p className={dashboardStyles.cardNote} style={{ color: 'var(--color-danger)', marginTop: '0.6rem' }}>
          {error}
        </p>
      )}
    </section>
  );
}

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
        <ModulesSection />
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
