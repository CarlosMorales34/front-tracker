'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WEEKDAY_FULL_LABELS, getWeekdayOfDateIso } from '../../../shared/lib/week';
import { CreateWorkoutInput, UpdateWorkoutInput, Workout, WorkoutRoutine } from '../types/workout.types';
import { sanitizeDecimal, sanitizeInt } from '../utils/numeric-input';
import { formatMMSS, formatDurationLabel } from '../utils/workout-format';
import styles from './weight.module.css';

interface DraftExercise {
  id: number;
  name: string;
  weight: string;
  sets: string;
  reps: string[];
}

interface NewWorkoutModalProps {
  workout?: Workout;
  routines?: WorkoutRoutine[];
  // Día seleccionado en WorkoutDayChipStrip -- solo aplica al crear (editar
  // conserva la fecha original del workout, ver handleSave).
  defaultDate?: string;
  onClose: () => void;
  onSave: (input: CreateWorkoutInput) => Promise<void>;
  onUpdate?: (id: string, input: UpdateWorkoutInput) => Promise<void>;
}

function draftExercisesFromRoutine(routine: WorkoutRoutine): DraftExercise[] {
  return routine.exercises.map((ex, index) => ({
    id: index,
    name: ex.name,
    weight: ex.suggestedWeight === null ? '' : String(ex.suggestedWeight),
    sets: String(ex.targetSets),
    reps: Array.from({ length: ex.targetSets }, () => String(ex.targetReps)),
  }));
}

function rangeDurationSeconds(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh! * 60 + em!) - (sh! * 60 + sm!);
  if (mins < 0) mins += 24 * 60;
  return mins * 60;
}

function draftExercisesFromWorkout(workout: Workout): DraftExercise[] {
  return workout.exercises.map((ex, index) => ({
    id: index,
    name: ex.name,
    weight: ex.weight === null ? '' : String(ex.weight),
    sets: String(ex.sets),
    reps: ex.reps.map((rep) => String(rep)),
  }));
}

export function NewWorkoutModal({ workout, routines = [], defaultDate, onClose, onSave, onUpdate }: NewWorkoutModalProps) {
  const isEditing = workout !== undefined;
  // Editar no tiene cronómetro corriendo -- el tiempo ya quedó fijo al
  // guardar la sesión, así que se precarga como duración "congelada" en vez
  // de reanudar un timer que nunca existió en ese modo.
  const [timeMode, setTimeMode] = useState<'timer' | 'range'>('timer');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(workout?.durationSeconds ?? 0);
  const [, forceTick] = useState(0);
  const timerStartedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rangeStart, setRangeStart] = useState('18:00');
  const [rangeEnd, setRangeEnd] = useState('19:00');

  const nextIdRef = useRef(workout?.exercises.length ?? 1);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>(() =>
    workout ? draftExercisesFromWorkout(workout) : [{ id: 0, name: '', weight: '', sets: '1', reps: [''] }],
  );
  const [comments, setComments] = useState(workout?.comments ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  // Solo al crear (no editar) y solo si hay una rutina asociada al día
  // seleccionado -- se sugiere, no se aplica sola, para no pisar lo que el
  // usuario ya haya empezado a escribir.
  const suggestedRoutine =
    !isEditing && defaultDate
      ? routines.find((r) => r.weekday === getWeekdayOfDateIso(defaultDate))
      : undefined;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentElapsed = () =>
    elapsedSeconds + (timerRunning && timerStartedAtRef.current ? Math.floor((Date.now() - timerStartedAtRef.current) / 1000) : 0);

  const startTimer = () => {
    timerStartedAtRef.current = Date.now();
    setTimerRunning(true);
    intervalRef.current = setInterval(() => forceTick((n) => n + 1), 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedSeconds(currentElapsed());
    setTimerRunning(false);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    setElapsedSeconds(0);
    timerStartedAtRef.current = null;
  };

  const addDraftExercise = () => {
    setDraftExercises((prev) => [
      ...prev,
      { id: nextIdRef.current++, name: '', weight: '', sets: '3', reps: ['', '', ''] },
    ]);
  };

  // Usar una rutina reemplaza los ejercicios del borrador con su plantilla
  // (series/reps/peso sugerido) -- es solo un punto de partida, todo queda
  // editable y el entrenamiento guardado no conserva referencia a la rutina.
  const applyRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    nextIdRef.current = routine.exercises.length;
    setDraftExercises(draftExercisesFromRoutine(routine));
  };

  const acceptSuggestedRoutine = () => {
    if (!suggestedRoutine) return;
    applyRoutine(suggestedRoutine.id);
    setSuggestionDismissed(true);
  };

  const removeDraftExercise = (id: number) => {
    setDraftExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: number, changes: Partial<DraftExercise>) => {
    setDraftExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...changes } : ex)));
  };

  // El campo se puede dejar vacío mientras se tipea (no fuerza un mínimo) --
  // solo regenera las filas de reps cuando el valor ya es un entero válido,
  // para no colapsar la lista de reps a la primera tecla.
  const updateSets = (id: number, rawValue: string) => {
    const digits = sanitizeInt(rawValue);
    const parsed = Number(digits);
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== id) return ex;
        if (digits === '' || parsed < 1) return { ...ex, sets: digits };
        const reps = Array.from({ length: parsed }, (_, i) => ex.reps[i] ?? '');
        return { ...ex, sets: digits, reps };
      }),
    );
  };

  const updateRep = (id: number, index: number, rawValue: string) => {
    const digits = sanitizeInt(rawValue);
    setDraftExercises((prev) =>
      prev.map((ex) => (ex.id !== id ? ex : { ...ex, reps: ex.reps.map((r, i) => (i === index ? digits : r)) })),
    );
  };

  const handleSave = async () => {
    const validExercises = draftExercises.filter((ex) => ex.name.trim().length > 0);
    if (validExercises.length === 0) {
      onClose();
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    const durationSeconds = timeMode === 'range' ? rangeDurationSeconds(rangeStart, rangeEnd) : currentElapsed();

    const exercises = validExercises.map((ex) => ({
      name: ex.name.trim(),
      weight: ex.weight.trim() === '' ? null : Number(ex.weight),
      sets: Number(ex.sets) || ex.reps.length,
      reps: ex.reps.map((rep) => Number(rep) || 0),
    }));
    const comment = comments.trim().length > 0 ? comments.trim() : null;

    setIsSaving(true);
    try {
      if (isEditing && workout && onUpdate) {
        await onUpdate(workout.id, { workoutDate: workout.workoutDate, durationSeconds, comments: comment, exercises });
      } else {
        await onSave({ workoutDate: defaultDate, durationSeconds, comments: comment, exercises });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar entrenamiento' : 'Nuevo entrenamiento'} onClose={onClose}>
      <div className={uiStyles.modalForm}>
        <div className={styles.modalTabToggle} style={{ marginBottom: '0.9rem' }}>
          <button type="button" data-selected={timeMode === 'timer'} onClick={() => setTimeMode('timer')}>
            Cronómetro
          </button>
          <button type="button" data-selected={timeMode === 'range'} onClick={() => setTimeMode('range')}>
            Rango de horas
          </button>
        </div>

        {timeMode === 'timer' ? (
          <div className={`${uiStyles.card} ${styles.timerCard}`}>
            <p className={uiStyles.cardLabel}>Tiempo de la rutina</p>
            <div className={styles.timerDisplay}>{formatMMSS(currentElapsed())}</div>
            <div className={styles.timerActions}>
              {timerRunning ? (
                <button type="button" className={styles.timerButton} onClick={pauseTimer}>
                  Pausar
                </button>
              ) : (
                <button type="button" className={`${styles.timerButton} ${styles.timerButtonPrimary}`} onClick={startTimer}>
                  {elapsedSeconds > 0 ? 'Reanudar' : 'Iniciar'}
                </button>
              )}
              <button type="button" className={styles.timerButton} onClick={resetTimer}>
                Reiniciar
              </button>
            </div>
          </div>
        ) : (
          <div className={`${uiStyles.card} ${styles.rangeCard}`}>
            <p className={uiStyles.cardLabel}>Duración por rango de horas</p>
            <div className={styles.rangeRow}>
              <input type="time" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
              <span>–</span>
              <input type="time" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
            </div>
            <p className={styles.rangeDurationLabel}>{formatDurationLabel(rangeDurationSeconds(rangeStart, rangeEnd))}</p>
          </div>
        )}

        {suggestedRoutine && !suggestionDismissed && (
          <div className={uiStyles.card} style={{ padding: '0.85rem 1rem' }}>
            <p className={uiStyles.cardNote} style={{ marginBottom: '0.65rem' }}>
              Rutina recomendada para hoy ({WEEKDAY_FULL_LABELS[suggestedRoutine.weekday!]}):{' '}
              <strong>{suggestedRoutine.name}</strong>. ¿Quieres usarla?
            </p>
            <div className={uiStyles.modalActions} style={{ marginTop: 0 }}>
              <button type="button" className={uiStyles.modalCancelButton} onClick={() => setSuggestionDismissed(true)}>
                Ahora no
              </button>
              <button type="button" className={uiStyles.modalPrimaryButton} onClick={acceptSuggestedRoutine}>
                Usar rutina
              </button>
            </div>
          </div>
        )}

        {routines.length > 0 && (
          <label className={uiStyles.modalLabel}>
            Usar rutina (opcional)
            <select
              className={uiStyles.modalInput}
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyRoutine(event.target.value);
                event.target.value = '';
              }}
            >
              <option value="" disabled>
                Elegir rutina para precargar ejercicios…
              </option>
              {routines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                  {routine.weekday !== null ? ` · ${WEEKDAY_FULL_LABELS[routine.weekday]}` : ''}
                </option>
              ))}
            </select>
          </label>
        )}

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
                inputMode="decimal"
                placeholder="peso"
                value={ex.weight}
                onChange={(event) => updateExercise(ex.id, { weight: sanitizeDecimal(event.target.value) })}
              />
              <span className={styles.draftInlineLabel}>lbs ×</span>
              <input
                className={styles.draftSmallInput}
                type="text"
                inputMode="numeric"
                placeholder="series"
                value={ex.sets}
                onChange={(event) => updateSets(ex.id, event.target.value)}
              />
              <span className={styles.draftInlineLabel}>series</span>
              <span className={styles.draftDivider} />
              {ex.reps.map((rep, index) => (
                <input
                  key={index}
                  className={styles.draftSmallInput}
                  type="text"
                  inputMode="numeric"
                  placeholder="reps"
                  title={`reps serie ${index + 1}`}
                  value={rep}
                  onChange={(event) => updateRep(ex.id, index, event.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
        <button type="button" className={styles.addExerciseButton} onClick={addDraftExercise}>
          <PlusIcon /> Agregar ejercicio
        </button>

        <label className={uiStyles.modalLabel}>
          Comentarios de la sesión
          <textarea
            className={uiStyles.modalInput}
            rows={3}
            placeholder="¿Cómo te sentiste? ¿Algo a ajustar?"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
          />
        </label>

        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={uiStyles.modalPrimaryButton} onClick={handleSave} disabled={isSaving}>
            {isEditing ? 'Guardar cambios' : 'Guardar entrenamiento'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
