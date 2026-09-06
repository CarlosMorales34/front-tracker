'use client';

import { useEffect, useMemo, useState } from 'react';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WorkoutPerformance } from '../types/workout.types';
import { formatDayLabel } from '../utils/workout-format';
import styles from './training.module.css';
import { WorkoutLineChart } from './WorkoutLineChart';
import { WorkoutValueChips } from './WorkoutValueChips';

interface WorkoutPerformanceSectionProps {
  performance: WorkoutPerformance;
}

type ProgressionMode = 'exercise' | 'session';
type OriginFilter = 'all' | 'free' | 'routine';

function matchesOrigin(sourceRoutineId: string | null, filter: OriginFilter): boolean {
  if (filter === 'all') return true;
  return filter === 'free' ? sourceRoutineId === null : sourceRoutineId !== null;
}

export function WorkoutPerformanceSection({ performance }: WorkoutPerformanceSectionProps) {
  const [mode, setMode] = useState<ProgressionMode>('exercise');
  // Filtra el historial (volumen por sesión + progresión) por si el
  // entrenamiento fue libre o se originó de una rutina -- "Todos" muestra
  // ambos mezclados, como antes.
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(performance.exercises[0]?.name ?? null);
  const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(
    performance.sessions[performance.sessions.length - 1]?.workoutDate ?? null,
  );

  const filteredSessions = useMemo(
    () => performance.sessions.filter((s) => matchesOrigin(s.sourceRoutineId, originFilter)),
    [performance.sessions, originFilter],
  );

  const filteredExercises = useMemo(
    () =>
      performance.exercises
        .map((ex) => ({ ...ex, history: ex.history.filter((h) => matchesOrigin(h.sourceRoutineId, originFilter)) }))
        .filter((ex) => ex.history.length > 0),
    [performance.exercises, originFilter],
  );

  // performance llega async desde el padre (arranca vacío, se actualiza al
  // cargar) -- el initializer de useState solo corre en el primer render, así
  // que hay que resincronizar cuando la lista (filtrada) cambia y la
  // selección actual ya no es válida (p.ej. era null porque no había datos,
  // o quedó fuera del filtro de origen elegido).
  useEffect(() => {
    if (filteredExercises.length === 0) {
      if (selectedExercise !== null) setSelectedExercise(null);
      return;
    }
    const stillValid = filteredExercises.some((ex) => ex.name === selectedExercise);
    if (!stillValid) {
      setSelectedExercise(filteredExercises[0]!.name);
    }
  }, [filteredExercises, selectedExercise]);

  useEffect(() => {
    if (filteredSessions.length === 0) {
      if (selectedSessionDate !== null) setSelectedSessionDate(null);
      return;
    }
    const stillValid = filteredSessions.some((s) => s.workoutDate === selectedSessionDate);
    if (!stillValid) {
      setSelectedSessionDate(filteredSessions[filteredSessions.length - 1]!.workoutDate);
    }
  }, [filteredSessions, selectedSessionDate]);

  const exerciseSeries = useMemo(
    () => filteredExercises.find((ex) => ex.name === selectedExercise) ?? null,
    [filteredExercises, selectedExercise],
  );

  const selectedSession = useMemo(
    () => filteredSessions.find((s) => s.workoutDate === selectedSessionDate) ?? null,
    [filteredSessions, selectedSessionDate],
  );

  if (performance.sessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.pesoTabToggle} style={{ marginBottom: '0.9rem' }}>
        <button type="button" data-selected={originFilter === 'all'} onClick={() => setOriginFilter('all')}>
          Todos
        </button>
        <button type="button" data-selected={originFilter === 'free'} onClick={() => setOriginFilter('free')}>
          Libres
        </button>
        <button type="button" data-selected={originFilter === 'routine'} onClick={() => setOriginFilter('routine')}>
          Con rutina
        </button>
      </div>

      <div className={uiStyles.card} style={{ marginBottom: '0.9rem' }}>
        <p className={uiStyles.cardLabel}>Volumen por sesión</p>
        {filteredSessions.length > 0 ? (
          <>
            <WorkoutLineChart values={filteredSessions.map((s) => s.volume)} />
            <WorkoutValueChips
              points={filteredSessions.map((s) => ({ label: formatDayLabel(s.workoutDate), value: s.volume }))}
              unit="vol."
            />
          </>
        ) : (
          <p className={styles.workoutsEmptyState}>Sin sesiones con este filtro todavía.</p>
        )}
        <p className={uiStyles.cardNote} style={{ marginTop: '0.6rem' }}>
          Volumen = peso × repeticiones totales de la sesión. No es una medida de calorías ni de intensidad —
          solo compara cuánta carga moviste entre sesiones.
        </p>
      </div>

      <div className={uiStyles.card} style={{ marginBottom: '1rem' }}>
        <p className={uiStyles.cardLabel}>Progresión</p>
        <div className={styles.pesoTabToggle} style={{ marginBottom: '0.7rem' }}>
          <button type="button" data-selected={mode === 'exercise'} onClick={() => setMode('exercise')}>
            Por ejercicio
          </button>
          <button type="button" data-selected={mode === 'session'} onClick={() => setMode('session')}>
            Por sesión
          </button>
        </div>

        {mode === 'exercise' ? (
          filteredExercises.length > 0 ? (
            <>
              <select
                className={styles.exercisePicker}
                value={selectedExercise ?? ''}
                onChange={(event) => setSelectedExercise(event.target.value)}
              >
                {filteredExercises.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
              {exerciseSeries && exerciseSeries.history.length > 0 ? (
                <>
                  <WorkoutLineChart values={exerciseSeries.history.map((h) => h.weight ?? 0)} />
                  <WorkoutValueChips
                    points={exerciseSeries.history.map((h) => ({ label: formatDayLabel(h.workoutDate), value: h.weight }))}
                    unit="lbs"
                  />
                </>
              ) : (
                <p className={styles.workoutsEmptyState}>Sin historial para este ejercicio todavía.</p>
              )}
            </>
          ) : (
            <p className={styles.workoutsEmptyState}>Sin ejercicios con este filtro todavía.</p>
          )
        ) : filteredSessions.length > 0 ? (
          <>
            <select
              className={styles.exercisePicker}
              value={selectedSessionDate ?? ''}
              onChange={(event) => setSelectedSessionDate(event.target.value)}
            >
              {[...filteredSessions].reverse().map((session) => (
                <option key={session.workoutDate} value={session.workoutDate}>
                  {formatDayLabel(session.workoutDate)}
                </option>
              ))}
            </select>
            {selectedSession && selectedSession.exercises.length > 0 ? (
              <>
                <WorkoutLineChart values={selectedSession.exercises.map((ex) => ex.weight ?? 0)} />
                <WorkoutValueChips
                  points={selectedSession.exercises.map((ex) => ({ label: ex.name, value: ex.weight }))}
                  unit="lbs"
                />
              </>
            ) : (
              <p className={styles.workoutsEmptyState}>Esa sesión no tiene ejercicios.</p>
            )}
          </>
        ) : (
          <p className={styles.workoutsEmptyState}>Sin sesiones con este filtro todavía.</p>
        )}
        <p className={uiStyles.cardNote} style={{ marginTop: '0.6rem' }}>
          El peso se muestra en libras (lbs). Un guion (–) significa que ese ejercicio no tiene peso
          registrado — normal en ejercicios de peso corporal (dominadas, plancha, etc.).
        </p>
      </div>
    </>
  );
}
