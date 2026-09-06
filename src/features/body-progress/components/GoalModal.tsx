'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { sanitizeDecimal } from '../../../shared/lib/numeric-input';
import { getTodayIso } from '../../../shared/lib/week';
import { BodyGoal, BodyGoalType, SetGoalInput } from '../types/body-progress.types';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import styles from './body-progress.module.css';

interface GoalModalProps {
  currentGoal: BodyGoal | null;
  currentWeightKg: number | null;
  onClose: () => void;
  onSave: (input: SetGoalInput) => Promise<void>;
}

const GOAL_TYPE_OPTIONS: { value: BodyGoalType; label: string }[] = [
  { value: 'lose', label: 'Bajar de peso' },
  { value: 'gain', label: 'Subir de peso' },
  { value: 'maintain', label: 'Mantener' },
  { value: 'recomp', label: 'Recomposición' },
];

// Fijar una meta nueva SIEMPRE crea una fila nueva en body_goals (ver
// SetBodyGoalUseCase) -- nunca sobreescribe la meta anterior, así se
// conserva el historial completo de objetivos del usuario.
export function GoalModal({ currentGoal, currentWeightKg, onClose, onSave }: GoalModalProps) {
  const [goalType, setGoalType] = useState<BodyGoalType>(currentGoal?.goalType ?? 'lose');
  const [startWeightKg, setStartWeightKg] = useState(
    (currentGoal?.startWeightKg ?? currentWeightKg ?? '').toString(),
  );
  const [targetWeightKg, setTargetWeightKg] = useState(currentGoal?.targetWeightKg?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const needsTarget = goalType === 'lose' || goalType === 'gain';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const start = Number(startWeightKg);
    if (!Number.isFinite(start) || start <= 0) {
      setError('El peso inicial debe ser un número mayor a 0.');
      return;
    }
    const target = targetWeightKg.trim() === '' ? null : Number(targetWeightKg);
    if (needsTarget && (!target || target <= 0)) {
      setError('Este objetivo necesita un peso meta.');
      return;
    }
    if (goalType === 'lose' && target! >= start) {
      setError('La meta debe ser menor al peso inicial para bajar de peso.');
      return;
    }
    if (goalType === 'gain' && target! <= start) {
      setError('La meta debe ser mayor al peso inicial para subir de peso.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        goalType,
        startWeightKg: start,
        targetWeightKg: target,
        startDate: getTodayIso(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la meta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={currentGoal ? 'Cambiar meta' : 'Fijar una meta'} onClose={onClose}>
      <form onSubmit={handleSubmit} className={uiStyles.modalForm}>
        <span className={uiStyles.modalLabel}>Tipo de objetivo</span>
        <div className={styles.goalTypeGrid}>
          {GOAL_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.goalTypeOption}
              data-selected={goalType === option.value}
              onClick={() => setGoalType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className={uiStyles.modalLabel}>
          Peso inicial (kg)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            value={startWeightKg}
            onChange={(event) => setStartWeightKg(sanitizeDecimal(event.target.value))}
          />
        </label>

        {needsTarget && (
          <label className={uiStyles.modalLabel}>
            Peso meta (kg)
            <input
              className={uiStyles.modalInput}
              type="text"
              inputMode="decimal"
              value={targetWeightKg}
              onChange={(event) => setTargetWeightKg(sanitizeDecimal(event.target.value))}
            />
          </label>
        )}

        {error && <p className={uiStyles.cardNote} style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={uiStyles.modalPrimaryButton} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
