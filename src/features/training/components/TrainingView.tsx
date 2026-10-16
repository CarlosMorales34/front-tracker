'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretLeftIcon, ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { OfflineQueuedError } from '../../../shared/lib/api-client';
import { addWeeks, getTodayIso, getWeekdayOfDateIso } from '../../../shared/lib/week';
import { formatTrainingWeekRange, getTrainingDayChips, getTrainingWeekStartIso } from '../utils/training-schedule';
import { workoutApi } from '../services/workout.api';
import { workoutRoutineApi } from '../services/workout-routine.api';
import { exerciseCatalogApi } from '../services/exercise-catalog.api';
import { ExerciseCatalogModal } from './ExerciseCatalogModal';
import {
  CreateWorkoutInput,
  CatalogExercise,
  TrainingSettings,
  TrainingStreak,
  UpdateWorkoutInput,
  Workout,
  WorkoutPerformance,
  WorkoutRoutine,
  WorkoutRoutineInput,
} from '../types/workout.types';
import { formatDayLabel, formatDurationLabel, formatRepsLabel } from '../utils/workout-format';
import styles from './training.module.css';
import { NewWorkoutModal } from './NewWorkoutModal';
import { NewWorkoutRoutineModal } from './NewWorkoutRoutineModal';
import { RestDaysSettings } from './RestDaysSettings';
import { RoutinesSection } from './RoutinesSection';
import { WorkoutDayChipStrip } from './WorkoutDayChipStrip';
import { WorkoutPerformanceSection } from './WorkoutPerformanceSection';

function pickDefaultDay(weekStartIso: string, includeWeekend: boolean): string {
  const chips = getTrainingDayChips(weekStartIso, includeWeekend);
  const today = getTodayIso();
  return chips.find((day) => day.dateIso === today)?.dateIso ?? chips[0]!.dateIso;
}

export function TrainingView() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [weekStart, setWeekStart] = useState(getTrainingWeekStartIso);
  const [includeWeekend, setIncludeWeekend] = useState(() => [0, 6].includes(getWeekdayOfDateIso(getTodayIso())));
  const [selectedDayIso, setSelectedDayIso] = useState(getTodayIso);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [performance, setPerformance] = useState<WorkoutPerformance | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [streak, setStreak] = useState<TrainingStreak | null>(null);
  const [trainingSettings, setTrainingSettings] = useState<TrainingSettings | null>(null);
  const [isSavingRestDays, setIsSavingRestDays] = useState(false);
  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routinesReady, setRoutinesReady] = useState(false);
  const catalogCreated = (exercise: CatalogExercise) => setCatalog(previous => [...previous.filter(row => row.id !== exercise.id), exercise].sort((a,b) => a.name.localeCompare(b.name)));

  const dayChips = useMemo(() => getTrainingDayChips(weekStart, includeWeekend), [weekStart, includeWeekend]);
  const dayWorkouts = useMemo(
    () => workouts.filter((workout) => workout.workoutDate === selectedDayIso),
    [workouts, selectedDayIso],
  );

  useEffect(() => {
    setSelectedDayIso(previous => dayChips.some(day => day.dateIso === previous) ? previous : pickDefaultDay(weekStart, includeWeekend));
  }, [weekStart, includeWeekend, dayChips]);

  const load = useCallback(async () => {
    const [weekWorkouts, workoutPerformance, workoutRoutines, trainingStreak, settings, exercises] = await Promise.all([
      workoutApi.listForWeek(weekStart, accessToken),
      workoutApi.getPerformance(accessToken),
      workoutRoutineApi.list(accessToken),
      workoutApi.getStreak(accessToken),
      workoutApi.getSettings(accessToken),
      exerciseCatalogApi.list(accessToken),
    ]);
    setWorkouts(weekWorkouts);
    setPerformance(workoutPerformance);
    setRoutines(workoutRoutines);
    setStreak(trainingStreak);
    setTrainingSettings(settings);
    setCatalog(exercises);
    setRoutinesReady(true);
    setLoadError(null);
  }, [weekStart, accessToken]);

  useEffect(() => {
    if (accessToken) load().catch(() => setLoadError('No se pudieron cargar tus entrenamientos.'));
  }, [accessToken, load]);

  // Abre el modal de "nuevo entrenamiento" cuando se llega acá desde el
  // botón central de acción rápida (ver QuickActionButton / quick-actions.ts),
  // que navega a /salud/entrenamientos?crear=entrenamiento en vez de
  // duplicar este estado local.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('crear') === 'entrenamiento') {
      setModalOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Si no hay red, apiFetch encola la mutación sola y lanza
  // OfflineQueuedError en vez de un error real -- el dato ya quedó a salvo
  // en este dispositivo (ver shared/lib/offline/mutation-queue.ts), así que
  // acá se trata como éxito (cierra el modal igual) en vez de mostrarlo
  // como una falla.
  const ignoreIfQueued = (error: unknown) => {
    if (!(error instanceof OfflineQueuedError)) throw error;
  };

  const handleSave = async (input: CreateWorkoutInput) => {
    try {
      await workoutApi.create(input, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setModalOpen(false);
    load();
  };

  const handleUpdate = async (id: string, input: UpdateWorkoutInput) => {
    try {
      await workoutApi.update(id, input, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setEditingWorkout(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const workout = workouts.find((w) => w.id === id);
    const label = workout ? formatDayLabel(workout.workoutDate) : '';
    const ok = await confirm(`Estás a punto de borrar el entrenamiento del ${label}. ¿Estás seguro?`);
    if (!ok) return;
    try {
      await workoutApi.delete(id, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    load();
  };

  const handleSaveRoutine = async (input: WorkoutRoutineInput) => {
    try {
      await workoutRoutineApi.create(input, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setRoutineModalOpen(false);
    load();
  };

  const handleUpdateRoutine = async (input: WorkoutRoutineInput) => {
    if (!editingRoutine) return;
    try {
      await workoutRoutineApi.update(editingRoutine.id, input, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setEditingRoutine(null);
    load();
  };

  const handleToggleRestDay = async (weekday: number) => {
    if (!trainingSettings) return;
    const next = trainingSettings.restWeekdays.includes(weekday)
      ? trainingSettings.restWeekdays.filter((day) => day !== weekday)
      : [...trainingSettings.restWeekdays, weekday];
    setTrainingSettings({ restWeekdays: next });
    setIsSavingRestDays(true);
    try {
      await workoutApi.updateSettings({ restWeekdays: next }, accessToken);
      const trainingStreak = await workoutApi.getStreak(accessToken);
      setStreak(trainingStreak);
    } catch (error) {
      setTrainingSettings(trainingSettings);
      ignoreIfQueued(error);
    } finally {
      setIsSavingRestDays(false);
    }
  };

  const handleDeleteRoutine = async (routine: WorkoutRoutine) => {
    const ok = await confirm(`Estás a punto de borrar la rutina "${routine.name}". ¿Estás seguro?`);
    if (!ok) return;
    try {
      await workoutRoutineApi.delete(routine.id, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    load();
  };

  return (
    <div>
      {loadError && <p role="alert">{loadError}<button type="button" onClick={() => load().catch(() => setLoadError('No se pudieron cargar tus entrenamientos.'))}>Reintentar</button></p>}
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
            <p className={styles.workoutsHeaderTitle}>{formatTrainingWeekRange(weekStart, includeWeekend)}</p>
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

      {streak && (
        <div className={`${uiStyles.card} ${styles.streakCard}`}>
          <p className={uiStyles.cardLabel}>Racha de entrenamiento</p>
          {streak.hasData ? (
            <p className={uiStyles.bigStat}>
              🔥 {streak.days} <span className={styles.streakCaption}>día{streak.days === 1 ? '' : 's'} seguidos</span>
            </p>
          ) : (
            <p className={uiStyles.cardNote}>
              Entrena hoy (libre o con una rutina) para empezar tu racha. Se pierde si pasas un día sin entrenar
              (salvo tus días de descanso).
            </p>
          )}
          {trainingSettings && (
            <RestDaysSettings
              restWeekdays={trainingSettings.restWeekdays}
              onToggle={handleToggleRestDay}
              isSaving={isSavingRestDays}
            />
          )}
        </div>
      )}

      <label className={styles.scheduleToggle}><input type="checkbox" checked={includeWeekend} onChange={event => setIncludeWeekend(event.target.checked)} />Fin de semana</label>
      <WorkoutDayChipStrip days={dayChips} selectedDateIso={selectedDayIso} onSelect={setSelectedDayIso} />

      <RoutinesSection
        routines={routines}
        onAddClick={() => setRoutineModalOpen(true)}
        onEdit={setEditingRoutine}
        onDelete={handleDeleteRoutine}
      />
      <button type="button" className={styles.addWorkoutButton} onClick={() => setCatalogOpen(true)}><PencilIcon /> Catálogo de ejercicios</button>

      {performance && <WorkoutPerformanceSection performance={performance} />}

      <div>
        {dayWorkouts.map((workout) => (
          <div key={workout.id} className={`${uiStyles.card} ${styles.workoutCard}`}>
            <div className={styles.workoutCardTop}>
              <div>
                <p className={styles.workoutDateLabel}>{formatDayLabel(workout.workoutDate)}</p>
                {workout.exercises.map((exercise) => (
                  <p key={exercise.id} className={styles.exerciseLine}>
                    <strong>{exercise.name}</strong> · {exercise.sets}x — {formatRepsLabel(exercise.weight, exercise.reps, exercise.isBodyweight)}
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
          catalog={catalog}
          routinesReady={routinesReady}
          onCatalogCreated={catalogCreated}
          routines={routines}
          defaultDate={selectedDayIso}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {editingWorkout && (
        <NewWorkoutModal
          catalog={catalog}
          onCatalogCreated={catalogCreated}
          workout={editingWorkout}
          routines={routines}
          onClose={() => setEditingWorkout(null)}
          onSave={handleSave}
          onUpdate={handleUpdate}
        />
      )}
      {isRoutineModalOpen && (
        <NewWorkoutRoutineModal catalog={catalog} onCatalogCreated={catalogCreated} onClose={() => setRoutineModalOpen(false)} onSave={handleSaveRoutine} />
      )}
      {editingRoutine && (
        <NewWorkoutRoutineModal
          catalog={catalog}
          onCatalogCreated={catalogCreated}
          routine={editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onSave={handleUpdateRoutine}
        />
      )}
      {catalogOpen && <ExerciseCatalogModal catalog={catalog} onClose={() => setCatalogOpen(false)} onChanged={load} />}
    </div>
  );
}
