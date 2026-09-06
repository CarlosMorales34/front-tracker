'use client';

import { useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { UserModules } from '../auth/types/auth.types';
import { Modal } from '../../shared/components/ui/Modal';
import uiStyles from '../../shared/components/ui/ui.module.css';

const MODULE_OPTIONS: { key: keyof UserModules; label: string }[] = [
  { key: 'hasActivities', label: 'Actividades diarias y Registro semanal' },
  { key: 'hasFinance', label: 'Finanzas y Gastos diarios' },
  { key: 'hasHealth', label: 'Peso y Entrenamientos' },
];

// Primer paso del onboarding (antes del tour guiado) -- separado de crear la
// cuenta a propósito: registrarse solo pide correo/contraseña/nombre, y acá,
// ya logueado, se elige qué partes de la app quiere ver. Los 3 vienen
// pre-marcados para que "Continuar" sin tocar nada equivalga a tenerlos
// todos, igual que si nunca hubiera pasado por acá.
export function ModuleSelectionModal({ onDone }: { onDone: () => void }) {
  const { updateModules } = useAuth();
  const [hasActivities, setHasActivities] = useState(true);
  const [hasFinance, setHasFinance] = useState(true);
  const [hasHealth, setHasHealth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const values: Record<keyof UserModules, boolean> = { hasActivities, hasFinance, hasHealth };
  const setters: Record<keyof UserModules, (value: boolean) => void> = {
    hasActivities: setHasActivities,
    hasFinance: setHasFinance,
    hasHealth: setHasHealth,
  };

  const handleContinue = async () => {
    if (!hasActivities && !hasFinance && !hasHealth) {
      setError('Elige al menos una parte de la app para usar.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateModules({ hasActivities, hasFinance, hasHealth });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tu selección.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Configura tu app" onClose={handleContinue}>
      <div className={uiStyles.modalForm}>
        <p className={uiStyles.cardNote}>
          ¿Qué partes de Bienestar Integral quieres usar? Puedes cambiar esto después desde Ajustes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {MODULE_OPTIONS.map((option) => (
            <label
              key={option.key}
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={values[option.key]}
                onChange={(event) => setters[option.key](event.target.checked)}
              />
              {option.label}
            </label>
          ))}
        </div>
        {error && <p className={uiStyles.cardNote} style={{ color: 'var(--color-danger)' }}>{error}</p>}
        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalPrimaryButton} onClick={handleContinue} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Continuar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
