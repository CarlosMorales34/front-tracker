'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { clearDraft, loadDraft, saveDraft } from '../../../shared/lib/local-draft';
import { WEEKDAY_FULL_LABELS } from '../../../shared/lib/week';
import { WorkoutRoutine, WorkoutRoutineInput } from '../types/workout.types';
import { sanitizeDecimal, sanitizeInt } from '../utils/numeric-input';
import styles from './weight.module.css';

interface DraftRoutineExercise {
  id: number;
  name: string;
  targetSets: string;
  targetReps: string;
  suggestedWeight: string;
}

interface NewWorkoutRoutineModalProps {
  routine?: WorkoutRoutine;
  onClose: () => void;
  onSave: (input: WorkoutRoutineInput) => Promise<void>;
}

// Un solo borrador activo a la vez, mismo criterio que NewWorkoutModal --
// solo aplica al crear, no al editar una rutina existente.
const DRAFT_KEY = 'new-workout-routine';

interface RoutineDraft {
  name: string;
  weekday: number | null;
  draftExercises: DraftRoutineExercise[];
}

function draftFromRoutine(routine: WorkoutRoutine): DraftRoutineExercise[] {
  return routine.exercises.map((ex, index) => ({
    id: index,
    name: ex.name,
    targetSets: String(ex.targetSets),
    targetReps: String(ex.targetReps),
    suggestedWeight: ex.suggestedWeight === null ? '' : String(ex.suggestedWeight),
  }));
}

export function NewWorkoutRoutineModal({ routine, onClose, onSave }: NewWorkoutRoutineModalProps) {
  const isEditing = routine !== undefined;
  const [name, setName] = useState(routine?.name ?? '');
  const [weekday, setWeekday] = useState<number | null>(routine?.weekday ?? null);
  const nextIdRef = useRef(routine?.exercises.length ?? 1);
  const [draftExercises, setDraftExercises] = useState<DraftRoutineExercise[]>(() =>
    routine ? draftFromRoutine(routine) : [{ id: 0, name: '', targetSets: '3', targetReps: '10', suggestedWeight: '' }],
  );
  const [isSaving, setIsSaving] = useState(false);

  const [pendingDraft, setPendingDraft] = useState<RoutineDraft | null>(null);
  const [draftChecked, setDraftChecked] = useState(isEditing);

  useEffect(() => {
    if (isEditing) return;
    const stored = loadDraft<RoutineDraft>(DRAFT_KEY);
    if (stored) setPendingDraft(stored.value);
    setDraftChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recoverDraft = () => {
    if (!pendingDraft) return;
    setName(pendingDraft.name);
    setWeekday(pendingDraft.weekday);
    setDraftExercises(pendingDraft.draftExercises);
    nextIdRef.current = pendingDraft.draftExercises.length;
    setPendingDraft(null);
  };

  const discardDraft = () => {
    clearDraft(DRAFT_KEY);
    setPendingDraft(null);
  };

  useEffect(() => {
    if (isEditing || !draftChecked || pendingDraft) return;
    const timeout = setTimeout(() => {
      saveDraft<RoutineDraft>(DRAFT_KEY, { name, weekday, draftExercises });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, draftChecked, pendingDraft, name, weekday, draftExercises]);

  const addDraftExercise = () => {
    setDraftExercises((prev) => [
      ...prev,
      { id: nextIdRef.current++, name: '', targetSets: '3', targetReps: '10', suggestedWeight: '' },
    ]);
  };

  const removeDraftExercise = (id: number) => {
    setDraftExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: number, changes: Partial<DraftRoutineExercise>) => {
    setDraftExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...changes } : ex)));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const validExercises = draftExercises.filter((ex) => ex.name.trim().length > 0);
    if (validExercises.length === 0) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        weekday,
        exercises: validExercises.map((ex) => ({
          name: ex.name.trim(),
          targetSets: Number(ex.targetSets) || 1,
          targetReps: Number(ex.targetReps) || 1,
          suggestedWeight: ex.suggestedWeight.trim() === '' ? null : Number(ex.suggestedWeight),
        })),
      });
      clearDraft(DRAFT_KEY);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar rutina' : 'Nueva rutina'} onClose={onClose}>
      <div className={uiStyles.modalForm}>
        {pendingDraft && (
          <div className={uiStyles.card} style={{ padding: '0.85rem 1rem' }}>
            <p className={uiStyles.cardNote} style={{ marginBottom: '0.65rem' }}>
              Tienes un borrador sin guardar de una rutina anterior. ¿Quieres recuperarlo?
            </p>
            <div className={uiStyles.modalActions} style={{ marginTop: 0 }}>
              <button type="button" className={uiStyles.modalCancelButton} onClick={discardDraft}>
                Descartar
              </button>
              <button type="button" className={uiStyles.modalPrimaryButton} onClick={recoverDraft}>
                Recuperar borrador
              </button>
            </div>
          </div>
        )}

        <label className={uiStyles.modalLabel}>
          Nombre
          <input
            className={uiStyles.modalInput}
            type="text"
            placeholder="Ej. Día de pierna"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Día de la semana (opcional)
          <select
            className={uiStyles.modalInput}
            value={weekday ?? ''}
            onChange={(event) => setWeekday(event.target.value === '' ? null : Number(event.target.value))}
          >
            <option value="">Sin día asociado</option>
            {WEEKDAY_FULL_LABELS.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {draftExercises.map((ex) => (
          <div key={ex.id} className={styles.draftExerciseBlock}>
            <div className={styles.draftExerciseTop}>
              <input
                className={uiStyles.modalInput}
                type="text"
                placeholder="Ejercicio (ej. Sentadilla)"
                value={ex.name}
                onChange={(event) => updateExercise(ex.id, { name: event.target.value })}
              />
              <button
                type="button"
                className={uiStyles.iconInlineButton}
                onClick={() => removeDraftExercise(ex.id)}
                aria-label="Quitar ejercicio"
              >
                <TrashIcon />
              </button>
            </div>
            <div className={styles.draftExerciseRow}>
              <input
                className={styles.draftSmallInput}
                type="text"
                inputMode="numeric"
                placeholder="series"
                value={ex.targetSets}
                onChange={(event) => updateExercise(ex.id, { targetSets: sanitizeInt(event.target.value) })}
              />
              <span className={styles.draftInlineLabel}>series ×</span>
              <input
                className={styles.draftSmallInput}
                type="text"
                inputMode="numeric"
                placeholder="reps"
                value={ex.targetReps}
                onChange={(event) => updateExercise(ex.id, { targetReps: sanitizeInt(event.target.value) })}
              />
              <span className={styles.draftInlineLabel}>reps</span>
              <span className={styles.draftDivider} />
              <input
                className={styles.draftSmallInput}
                type="text"
                inputMode="decimal"
                placeholder="peso sugerido"
                value={ex.suggestedWeight}
                onChange={(event) => updateExercise(ex.id, { suggestedWeight: sanitizeDecimal(event.target.value) })}
              />
              <span className={styles.draftInlineLabel}>lbs</span>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addExerciseButton} onClick={addDraftExercise}>
          <PlusIcon /> Agregar ejercicio
        </button>

        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={uiStyles.modalPrimaryButton} onClick={handleSave} disabled={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Crear rutina'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
