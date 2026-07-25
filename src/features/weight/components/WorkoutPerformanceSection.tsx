'use client';

import { useEffect, useMemo, useState } from 'react';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WorkoutPerformance } from '../types/workout.types';
import { formatDayLabel } from '../utils/workout-format';
import styles from './weight.module.css';
import { WorkoutLineChart } from './WorkoutLineChart';

interface WorkoutPerformanceSectionProps {
  performance: WorkoutPerformance;
}

export function WorkoutPerformanceSection({ performance }: WorkoutPerformanceSectionProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(performance.exercises[0]?.name ?? null);

  // performance llega async desde el padre (arranca vacío, se actualiza al
  // cargar) -- el initializer de useState solo corre en el primer render, así
  // que hay que resincronizar cuando la lista de ejercicios cambia y la
  // selección actual ya no es válida (p.ej. era null porque no había datos).
  useEffect(() => {
    if (performance.exercises.length === 0) return;
    const stillValid = performance.exercises.some((ex) => ex.name === selectedExercise);
    if (!stillValid) {
      setSelectedExercise(performance.exercises[0]!.name);
    }
  }, [performance.exercises, selectedExercise]);

  const exerciseSeries = useMemo(
    () => performance.exercises.find((ex) => ex.name === selectedExercise) ?? null,
    [performance.exercises, selectedExercise],
  );

  if (performance.sessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={uiStyles.card} style={{ marginBottom: '0.9rem' }}>
        <p className={uiStyles.cardLabel}>Volumen por sesión</p>
        <WorkoutLineChart values={performance.sessions.map((s) => s.volume)} />
        <p className={uiStyles.cardNote}>
          {formatDayLabel(performance.sessions[0]!.workoutDate)} – {formatDayLabel(performance.sessions[performance.sessions.length - 1]!.workoutDate)}
        </p>
      </div>

      {performance.exercises.length > 0 && (
        <div className={uiStyles.card} style={{ marginBottom: '1rem' }}>
          <p className={uiStyles.cardLabel}>Progresión por ejercicio</p>
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
              <p className={uiStyles.cardNote}>
                Peso (lbs) · {formatDayLabel(exerciseSeries.history[0]!.workoutDate)} – {formatDayLabel(exerciseSeries.history[exerciseSeries.history.length - 1]!.workoutDate)}
              </p>
            </>
          ) : (
            <p className={styles.workoutsEmptyState}>Sin historial para este ejercicio todavía.</p>
          )}
        </div>
      )}
    </>
  );
}
