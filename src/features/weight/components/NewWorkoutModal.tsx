'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CreateWorkoutInput } from '../types/workout.types';
import { formatMMSS, formatDurationLabel } from '../utils/workout-format';
import styles from './weight.module.css';

interface DraftExercise {
  id: number;
  name: string;
  weight: string;
  sets: number;
  reps: number[];
}

interface NewWorkoutModalProps {
  onClose: () => void;
  onSave: (input: CreateWorkoutInput) => Promise<void>;
}

function rangeDurationSeconds(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh! * 60 + em!) - (sh! * 60 + sm!);
  if (mins < 0) mins += 24 * 60;
  return mins * 60;
}

export function NewWorkoutModal({ onClose, onSave }: NewWorkoutModalProps) {
  const [timeMode, setTimeMode] = useState<'timer' | 'range'>('timer');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [, forceTick] = useState(0);
  const timerStartedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rangeStart, setRangeStart] = useState('18:00');
  const [rangeEnd, setRangeEnd] = useState('19:00');

  const nextIdRef = useRef(1);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([
    { id: 0, name: '', weight: '', sets: 1, reps: [0] },
  ]);
  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    setDraftExercises((prev) => [...prev, { id: nextIdRef.current++, name: '', weight: '', sets: 3, reps: [0, 0, 0] }]);
  };

  const removeDraftExercise = (id: number) => {
    setDraftExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: number, changes: Partial<DraftExercise>) => {
    setDraftExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...changes } : ex)));
  };

  const updateSets = (id: number, rawValue: string) => {
    const n = Math.max(1, Number(rawValue) || 1);
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== id) return ex;
        const reps = Array.from({ length: n }, (_, i) => ex.reps[i] ?? 0);
        return { ...ex, sets: n, reps };
      }),
    );
  };

  const updateRep = (id: number, index: number, rawValue: string) => {
    setDraftExercises((prev) =>
      prev.map((ex) =>
        ex.id !== id ? ex : { ...ex, reps: ex.reps.map((r, i) => (i === index ? Number(rawValue) || 0 : r)) },
      ),
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

    setIsSaving(true);
    try {
      await onSave({
        durationSeconds,
        comments: comments.trim().length > 0 ? comments.trim() : null,
        exercises: validExercises.map((ex) => ({
          name: ex.name.trim(),
          weight: ex.weight.trim() === '' ? null : Number(ex.weight),
          sets: ex.sets,
          reps: ex.reps,
        })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Nuevo entrenamiento" onClose={onClose}>
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
                type="number"
                min={0}
                placeholder="peso"
                value={ex.weight}
                onChange={(event) => updateExercise(ex.id, { weight: event.target.value })}
              />
              <span className={styles.draftInlineLabel}>lbs ×</span>
              <input
                className={styles.draftSmallInput}
                type="number"
                min={1}
                value={ex.sets}
                onChange={(event) => updateSets(ex.id, event.target.value)}
              />
              <span className={styles.draftInlineLabel}>series</span>
              <span className={styles.draftDivider} />
              {ex.reps.map((rep, index) => (
                <input
                  key={index}
                  className={styles.draftSmallInput}
                  type="number"
                  min={0}
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
            Guardar entrenamiento
          </button>
        </div>
      </div>
    </Modal>
  );
}
