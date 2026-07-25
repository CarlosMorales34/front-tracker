'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { ClockIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { getCurrentWeekStartIso, formatWeekRangeLabel } from '../../../shared/lib/week';
import { workoutApi } from '../services/workout.api';
import { CreateWorkoutInput, Workout, WorkoutPerformance } from '../types/workout.types';
import { formatDayLabel, formatDurationLabel, formatRepsLabel } from '../utils/workout-format';
import styles from './weight.module.css';
import { NewWorkoutModal } from './NewWorkoutModal';
import { WorkoutPerformanceSection } from './WorkoutPerformanceSection';

export function WorkoutsTab() {
  const { accessToken } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [performance, setPerformance] = useState<WorkoutPerformance | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const weekStart = getCurrentWeekStartIso();

  const load = useCallback(async () => {
    const [weekWorkouts, workoutPerformance] = await Promise.all([
      workoutApi.listForWeek(weekStart, accessToken),
      workoutApi.getPerformance(accessToken),
    ]);
    setWorkouts(weekWorkouts);
    setPerformance(workoutPerformance);
  }, [weekStart, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleSave = async (input: CreateWorkoutInput) => {
    await workoutApi.create(input, accessToken);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await workoutApi.delete(id, accessToken);
    load();
  };

  return (
    <div>
      <div className={styles.workoutsHeader}>
        <div>
          <p className={styles.workoutsHeaderTitle}>{formatWeekRangeLabel(weekStart)}</p>
          <p className={styles.workoutsHeaderSubtitle}>{workouts.length} entrenamientos registrados</p>
        </div>
        <button type="button" className={styles.addWorkoutButton} onClick={() => setModalOpen(true)}>
          <PlusIcon /> Nuevo entrenamiento
        </button>
      </div>

      {performance && <WorkoutPerformanceSection performance={performance} />}

      <div>
        {workouts.map((workout) => (
          <div key={workout.id} className={`${uiStyles.card} ${styles.workoutCard}`}>
            <div className={styles.workoutCardTop}>
              <div>
                <p className={styles.workoutDateLabel}>{formatDayLabel(workout.workoutDate)}</p>
                {workout.exercises.map((exercise) => (
                  <p key={exercise.id} className={styles.exerciseLine}>
                    <strong>{exercise.name}</strong> · {exercise.sets}x — {formatRepsLabel(exercise.weight, exercise.reps)}
                  </p>
                ))}
              </div>
              <div className={styles.workoutMeta}>
                <span className={styles.durationTag}>
                  <ClockIcon width={12} height={12} /> {formatDurationLabel(workout.durationSeconds)}
                </span>
                <button
                  type="button"
                  className={uiStyles.iconInlineButton}
                  onClick={() => handleDelete(workout.id)}
                  aria-label="Eliminar"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            {workout.comments && <p className={styles.workoutComments}>{workout.comments}</p>}
          </div>
        ))}
        {workouts.length === 0 && <p className={styles.workoutsEmptyState}>Sin entrenamientos esta semana todavía.</p>}
      </div>

      {isModalOpen && <NewWorkoutModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
