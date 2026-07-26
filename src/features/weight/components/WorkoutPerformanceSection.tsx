'use client';

import { useEffect, useMemo, useState } from 'react';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WorkoutPerformance } from '../types/workout.types';
import { formatDayLabel } from '../utils/workout-format';
import styles from './weight.module.css';
import { WorkoutLineChart } from './WorkoutLineChart';
import { WorkoutValueChips } from './WorkoutValueChips';

interface WorkoutPerformanceSectionProps {
  performance: WorkoutPerformance;
}

type ProgressionMode = 'exercise' | 'session';

export function WorkoutPerformanceSection({ performance }: WorkoutPerformanceSectionProps) {
  const [mode, setMode] = useState<ProgressionMode>('exercise');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(performance.exercises[0]?.name ?? null);
  const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(
    performance.sessions[performance.sessions.length - 1]?.workoutDate ?? null,
  );

  // performance llega async desde el padre (arranca vacío, se actualiza al
  // cargar) -- el initializer de useState solo corre en el primer render, así
  // que hay que resincronizar cuando la lista cambia y la selección actual ya
  // no es válida (p.ej. era null porque no había datos).
  useEffect(() => {
    if (performance.exercises.length === 0) return;
    const stillValid = performance.exercises.some((ex) => ex.name === selectedExercise);
    if (!stillValid) {
      setSelectedExercise(performance.exercises[0]!.name);
    }
  }, [performance.exercises, selectedExercise]);

  useEffect(() => {
    if (performance.sessions.length === 0) return;
    const stillValid = performance.sessions.some((s) => s.workoutDate === selectedSessionDate);
    if (!stillValid) {
      setSelectedSessionDate(performance.sessions[performance.sessions.length - 1]!.workoutDate);
    }
  }, [performance.sessions, selectedSessionDate]);

  const exerciseSeries = useMemo(
    () => performance.exercises.find((ex) => ex.name === selectedExercise) ?? null,
    [performance.exercises, selectedExercise],
  );

  const selectedSession = useMemo(
    () => performance.sessions.find((s) => s.workoutDate === selectedSessionDate) ?? null,
    [performance.sessions, selectedSessionDate],
  );

  if (performance.sessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={uiStyles.card} style={{ marginBottom: '0.9rem' }}>
        <p className={uiStyles.cardLabel}>Volumen por sesión</p>
        <WorkoutLineChart values={performance.sessions.map((s) => s.volume)} />
        <WorkoutValueChips
          points={performance.sessions.map((s) => ({ label: formatDayLabel(s.workoutDate), value: s.volume }))}
          unit="vol."
        />
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
          performance.exercises.length > 0 ? (
            <>
              <select
                className={styles.exercisePicker}
                value={selectedExercise ?? ''}
                onChange={(event) => setSelectedExercise(event.target.value)}
              >
                {performance.exercises.map((ex) => (
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
            <p className={styles.workoutsEmptyState}>Sin ejercicios registrados todavía.</p>
          )
        ) : (
          <>
            <select
              className={styles.exercisePicker}
              value={selectedSessionDate ?? ''}
              onChange={(event) => setSelectedSessionDate(event.target.value)}
            >
              {[...performance.sessions].reverse().map((session) => (
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
        )}
        <p className={uiStyles.cardNote} style={{ marginTop: '0.6rem' }}>
          El peso se muestra en libras (lbs). Un guion (–) significa que ese ejercicio no tiene peso
          registrado — normal en ejercicios de peso corporal (dominadas, plancha, etc.).
        </p>
      </div>
    </>
  );
}
