'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretLeftIcon, ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { addWeeks, getCurrentWeekStartIso, formatWeekRangeLabel, getTodayIso, getWeekDayChips } from '../../../shared/lib/week';
import { workoutApi } from '../services/workout.api';
import { workoutRoutineApi } from '../services/workout-routine.api';
import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  Workout,
  WorkoutPerformance,
  WorkoutRoutine,
  WorkoutRoutineInput,
} from '../types/workout.types';
import { formatDayLabel, formatDurationLabel, formatRepsLabel } from '../utils/workout-format';
import styles from './weight.module.css';
import { NewWorkoutModal } from './NewWorkoutModal';
import { NewWorkoutRoutineModal } from './NewWorkoutRoutineModal';
import { RoutinesSection } from './RoutinesSection';
import { WorkoutDayChipStrip } from './WorkoutDayChipStrip';
import { WorkoutPerformanceSection } from './WorkoutPerformanceSection';

function pickDefaultDay(weekStartIso: string): string {
  const chips = getWeekDayChips(weekStartIso);
  const today = getTodayIso();
  return chips.find((day) => day.dateIso === today)?.dateIso ?? chips[0]!.dateIso;
}

export function WorkoutsTab() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStartIso());
  const [selectedDayIso, setSelectedDayIso] = useState(() => pickDefaultDay(getCurrentWeekStartIso()));
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [performance, setPerformance] = useState<WorkoutPerformance | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

  const dayChips = useMemo(() => getWeekDayChips(weekStart), [weekStart]);
  const dayWorkouts = useMemo(
    () => workouts.filter((workout) => workout.workoutDate === selectedDayIso),
    [workouts, selectedDayIso],
  );

  // Navegar de semana resetea el día seleccionado -- si hoy cae dentro de la
  // semana nueva se selecciona hoy, si no el primer día (sábado) de esa semana.
  useEffect(() => {
    setSelectedDayIso(pickDefaultDay(weekStart));
  }, [weekStart]);

  const load = useCallback(async () => {
    const [weekWorkouts, workoutPerformance, workoutRoutines] = await Promise.all([
      workoutApi.listForWeek(weekStart, accessToken),
      workoutApi.getPerformance(accessToken),
      workoutRoutineApi.list(accessToken),
    ]);
    setWorkouts(weekWorkouts);
    setPerformance(workoutPerformance);
    setRoutines(workoutRoutines);
  }, [weekStart, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleSave = async (input: CreateWorkoutInput) => {
    await workoutApi.create(input, accessToken);
    setModalOpen(false);
    load();
  };

  const handleUpdate = async (id: string, input: UpdateWorkoutInput) => {
    await workoutApi.update(id, input, accessToken);
    setEditingWorkout(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const workout = workouts.find((w) => w.id === id);
    const label = workout ? formatDayLabel(workout.workoutDate) : '';
    const ok = await confirm(`Estás a punto de borrar el entrenamiento del ${label}. ¿Estás seguro?`);
    if (!ok) return;
    await workoutApi.delete(id, accessToken);
    load();
  };

  const handleSaveRoutine = async (input: WorkoutRoutineInput) => {
    await workoutRoutineApi.create(input, accessToken);
    setRoutineModalOpen(false);
    load();
  };

  const handleUpdateRoutine = async (input: WorkoutRoutineInput) => {
    if (!editingRoutine) return;
    await workoutRoutineApi.update(editingRoutine.id, input, accessToken);
    setEditingRoutine(null);
    load();
  };

  const handleDeleteRoutine = async (routine: WorkoutRoutine) => {
    const ok = await confirm(`Estás a punto de borrar la rutina "${routine.name}". ¿Estás seguro?`);
    if (!ok) return;
    await workoutRoutineApi.delete(routine.id, accessToken);
    load();
  };

  return (
    <div>
      <div className={styles.workoutsHeader}>
        <div className={styles.workoutsWeekNav}>
          <button
            type="button"
            className={uiStyles.iconOnlyButton}
            onClick={() => setWeekStart((d) => addWeeks(d, -1))}
            aria-label="Semana anterior"
          >
            <CaretLeftIcon />
          </button>
          <div>
            <p className={styles.workoutsHeaderTitle}>{formatWeekRangeLabel(weekStart)}</p>
            <p className={styles.workoutsHeaderSubtitle}>{workouts.length} entrenamientos registrados</p>
          </div>
          <button
            type="button"
            className={uiStyles.iconOnlyButton}
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
            aria-label="Semana siguiente"
            style={{ transform: 'scaleX(-1)' }}
          >
            <CaretLeftIcon />
          </button>
        </div>
        <button type="button" className={styles.addWorkoutButton} onClick={() => setModalOpen(true)}>
          <PlusIcon /> Nuevo entrenamiento
        </button>
      </div>

      <WorkoutDayChipStrip days={dayChips} selectedDateIso={selectedDayIso} onSelect={setSelectedDayIso} />

      <RoutinesSection
        routines={routines}
        onAddClick={() => setRoutineModalOpen(true)}
        onEdit={setEditingRoutine}
        onDelete={handleDeleteRoutine}
      />

      {performance && <WorkoutPerformanceSection performance={performance} />}

      <div>
        {dayWorkouts.map((workout) => (
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
                  onClick={() => setEditingWorkout(workout)}
                  aria-label="Editar"
                >
                  <PencilIcon width={14} height={14} />
                </button>
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
        {dayWorkouts.length === 0 && <p className={styles.workoutsEmptyState}>Sin entrenamiento registrado este día.</p>}
      </div>

      {isModalOpen && (
        <NewWorkoutModal
          routines={routines}
          defaultDate={selectedDayIso}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {editingWorkout && (
        <NewWorkoutModal
          workout={editingWorkout}
          routines={routines}
          onClose={() => setEditingWorkout(null)}
          onSave={handleSave}
          onUpdate={handleUpdate}
        />
      )}
      {isRoutineModalOpen && (
        <NewWorkoutRoutineModal onClose={() => setRoutineModalOpen(false)} onSave={handleSaveRoutine} />
      )}
      {editingRoutine && (
        <NewWorkoutRoutineModal
          routine={editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onSave={handleUpdateRoutine}
        />
      )}
    </div>
  );
}
