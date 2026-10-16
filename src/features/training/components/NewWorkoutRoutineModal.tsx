'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { clearDraft, loadDraft, saveDraft } from '../../../shared/lib/local-draft';
import { WEEKDAY_FULL_LABELS } from '../../../shared/lib/week';
import { CatalogExercise, WorkoutRoutine, WorkoutRoutineInput } from '../types/workout.types';
import { ExercisePicker } from './ExercisePicker';
import { sanitizeDecimal, sanitizeInt } from '../../../shared/lib/numeric-input';
import styles from './training.module.css';

interface DraftRoutineExercise {
  exerciseId?: string | null;
  id: number;
  name: string;
  targetSets: string;
  targetReps: string;
  suggestedWeight: string;
  isBodyweight: boolean;
}

interface NewWorkoutRoutineModalProps {
  catalog: CatalogExercise[];
  onCatalogCreated: (exercise: CatalogExercise) => void;
  routine?: WorkoutRoutine;
  onClose: () => void;
  onSave: (input: WorkoutRoutineInput) => Promise<void>;
}

// Un solo borrador activo a la vez, mismo criterio que NewWorkoutModal --
// solo aplica al crear, no al editar una rutina existente.
const DRAFT_KEY = 'new-workout-routine';

const ROUTINE_PRESETS = [
  { name: 'Pecho, hombros y bíceps', days: [1, 4], pattern: /pecho|press banca|lagartija|flexion|apertura|press militar|hombro|elevacion|curl|martillo/ },
  { name: 'Pierna', days: [2, 5], pattern: /sentadilla|peso muerto|pantorrill|cuadriceps|femoral|prensa|zancada/ },
  { name: 'Espalda y tríceps', days: [3, 6], pattern: /remo|dominada|jalon|espalda|triceps|fondo/ },
];

interface RoutineDraft {
  name: string;
  weekday: number | null;
  weekdays?: number[];
  draftExercises: DraftRoutineExercise[];
}

function draftFromRoutine(routine: WorkoutRoutine): DraftRoutineExercise[] {
  return routine.exercises.map((ex, index) => ({
    id: index,
    name: ex.name,
    exerciseId: ex.exerciseId,
    targetSets: String(ex.targetSets),
    targetReps: String(ex.targetReps),
    suggestedWeight: ex.suggestedWeight === null ? '' : String(ex.suggestedWeight),
    isBodyweight: ex.isBodyweight,
  }));
}

export function NewWorkoutRoutineModal({ routine, catalog, onCatalogCreated, onClose, onSave }: NewWorkoutRoutineModalProps) {
  const isEditing = routine !== undefined;
  const [name, setName] = useState(routine?.name ?? '');
  const [weekdays, setWeekdays] = useState<number[]>(routine?.weekdays ?? (routine?.weekday == null ? [] : [routine.weekday]));
  const nextIdRef = useRef(routine?.exercises.length ?? 1);
  const [draftExercises, setDraftExercises] = useState<DraftRoutineExercise[]>(() =>
    routine
      ? draftFromRoutine(routine)
      : [{ id: 0, name: '', targetSets: '3', targetReps: '10', suggestedWeight: '', isBodyweight: false }],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setWeekdays(pendingDraft.weekdays ?? (pendingDraft.weekday === null ? [] : [pendingDraft.weekday]));
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
      saveDraft<RoutineDraft>(DRAFT_KEY, { name, weekday: weekdays.length === 1 ? weekdays[0]! : null, weekdays, draftExercises });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, draftChecked, pendingDraft, name, weekdays, draftExercises]);

  const addDraftExercise = () => {
    setDraftExercises((prev) => [
      ...prev,
      { id: nextIdRef.current++, name: '', targetSets: '3', targetReps: '10', suggestedWeight: '', isBodyweight: false },
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
    setSaveError(null);
    try {
      await onSave({
        name: name.trim(),
        weekday: weekdays.length === 1 ? weekdays[0]! : null,
        weekdays,
        exercises: validExercises.map((ex) => ({
          name: ex.name.trim(),
          exerciseId: ex.exerciseId,
          targetSets: Number(ex.targetSets) || 1,
          targetReps: Number(ex.targetReps) || 1,
          suggestedWeight: ex.suggestedWeight.trim() === '' ? null : Number(ex.suggestedWeight),
          isBodyweight: ex.isBodyweight,
        })),
      });
      clearDraft(DRAFT_KEY);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la rutina.');
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

        {!isEditing && <label className={uiStyles.modalLabel}>Distribución semanal<select className={uiStyles.modalInput} defaultValue="" onChange={event => {
          const preset = ROUTINE_PRESETS[Number(event.target.value)]; if (!preset) return;
          setName(preset.name); setWeekdays(preset.days);
          const matches = catalog.filter(exercise => {
            const name = exercise.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return preset.pattern.test(name) && (preset.days[0] !== 1 || !/femoral|pierna|cuadriceps/.test(name));
          });
          const rows: DraftRoutineExercise[] = matches.map((exercise, index) => ({ id: index, name: exercise.name, exerciseId: exercise.id, targetSets: '3', targetReps: '10', suggestedWeight: '', isBodyweight: /dominada|lagartija|flexion/i.test(exercise.name) }));
          setDraftExercises(rows.length ? rows : [{ id: 0, name: '', targetSets: '3', targetReps: '10', suggestedWeight: '', isBodyweight: false }]);
          nextIdRef.current = rows.length || 1;
        }}><option value="" disabled>Elegir distribución o personalizar</option>{ROUTINE_PRESETS.map((preset, index) => <option key={preset.name} value={index}>{preset.name}</option>)}</select></label>}
        <fieldset className={styles.routineWeekdays}><legend>Días habituales</legend>{WEEKDAY_FULL_LABELS.map((label, day) => <label key={day}><input type="checkbox" checked={weekdays.includes(day)} onChange={() => setWeekdays(days => days.includes(day) ? days.filter(value => value !== day) : [...days, day].sort((a,b) => a-b))} />{label}</label>)}</fieldset>

        {draftExercises.map((ex) => (
          <div key={ex.id} className={styles.draftExerciseBlock}>
            <div className={styles.draftExerciseTop}>
              <ExercisePicker catalog={catalog} exerciseId={ex.exerciseId} name={ex.name} onCreated={onCatalogCreated}
                onSelect={exercise => updateExercise(ex.id, { name: exercise.name, exerciseId: exercise.id })} />
              <button
                type="button"
                className={uiStyles.iconInlineButton}
                onClick={() => removeDraftExercise(ex.id)}
                aria-label="Quitar ejercicio"
              >
                <TrashIcon />
              </button>
            </div>
            <label className={styles.bodyweightToggle}>
              <input
                type="checkbox"
                className={styles.bodyweightCheckbox}
                checked={ex.isBodyweight}
                onChange={(event) => updateExercise(ex.id, { isBodyweight: event.target.checked, suggestedWeight: '' })}
              />
              Peso corporal
            </label>
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
              {!ex.isBodyweight && (
                <>
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
                </>
              )}
            </div>
          </div>
        ))}
        <button type="button" className={styles.addExerciseButton} onClick={addDraftExercise}>
          <PlusIcon /> Agregar ejercicio
        </button>

        <div className={`${uiStyles.modalActions} ${styles.trainingModalActions}`}>
          {saveError && <p role="alert">{saveError}</p>}
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
