'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { BarbellIcon, CaretLeftIcon, CaretRightIcon, ScaleIcon } from '../../../shared/components/icons/icons';
import { Spinner } from '../../../shared/components/ui/Spinner';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { OfflineQueuedError } from '../../../shared/lib/api-client';
import {
  addWeeks,
  formatWeekRangeLabel,
  getCurrentWeekStartIso,
  getTodayIso,
  getWeekdayOfDateIso,
  WEEKDAY_FULL_LABELS,
} from '../../../shared/lib/week';
import { MeasurementModal } from '../../body-progress/components/MeasurementModal';
import { bodyProgressApi } from '../../body-progress/services/body-progress.api';
import { BodyProgressSummary, MeasurementFields } from '../../body-progress/types/body-progress.types';
import { formatSignedKg, formatWeightKg } from '../../body-progress/utils/units';
import { NewWorkoutModal } from '../../training/components/NewWorkoutModal';
import { workoutApi } from '../../training/services/workout.api';
import { workoutRoutineApi } from '../../training/services/workout-routine.api';
import { CreateWorkoutInput, Workout, WorkoutRoutine } from '../../training/types/workout.types';
import styles from './health-summary.module.css';

function formatAccumulatedDuration(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes} min` : `${hours} h ${minutes} min`;
}

// Agrega, en un solo vistazo, lo que ya vive por separado en Progreso
// corporal y Entrenamientos -- los consume SOLO a través de sus
// services/components públicos (bodyProgressApi, workoutApi,
// workoutRoutineApi, MeasurementModal, NewWorkoutModal). Nunca lee sus
// tablas ni su estado interno directo: es una dependencia de ESTE resumen
// hacia esos dos módulos, nunca al revés, así que no crea el acoplamiento
// cruzado que el rediseño buscaba evitar entre Progreso corporal y
// Entrenamientos.
export function HealthSummaryView() {
  const { accessToken } = useAuth();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStartIso());
  const [bodySummary, setBodySummary] = useState<BodyProgressSummary | null>(null);
  const [weekWorkouts, setWeekWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);

  const load = useCallback(async () => {
    const [summary, workouts, workoutRoutines] = await Promise.all([
      bodyProgressApi.getSummary(accessToken),
      workoutApi.listForWeek(weekStart, accessToken),
      workoutRoutineApi.list(accessToken),
    ]);
    setBodySummary(summary);
    setWeekWorkouts(workouts);
    setRoutines(workoutRoutines);
  }, [weekStart, accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    setLoadError(false);
    load()
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [accessToken, load]);

  const today = getTodayIso();
  const todayWeekday = getWeekdayOfDateIso(today);
  const todayRoutine = useMemo(
    () => routines.find((routine) => routine.weekday === todayWeekday) ?? null,
    [routines, todayWeekday],
  );
  const hasLoggedToday = weekWorkouts.some((workout) => workout.workoutDate === today);
  // Cada rutina con día fijo recurre una vez por semana -- por eso el total
  // programado de la semana es simplemente cuántas rutinas tienen weekday
  // asignado, sin importar qué semana se esté viendo.
  const scheduledCount = useMemo(() => routines.filter((routine) => routine.weekday !== null).length, [routines]);
  const totalDurationSeconds = useMemo(
    () => weekWorkouts.reduce((sum, workout) => sum + workout.durationSeconds, 0),
    [weekWorkouts],
  );

  // Si no hay red, apiFetch encola la mutación sola y lanza
  // OfflineQueuedError en vez de un error real -- mismo criterio que
  // TrainingView/BodyProgressView: se trata como éxito, no como falla.
  const ignoreIfQueued = (error: unknown) => {
    if (!(error instanceof OfflineQueuedError)) throw error;
  };

  const handleSaveMeasurement = async (fields: MeasurementFields) => {
    try {
      await bodyProgressApi.createMeasurement(fields, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setMeasurementModalOpen(false);
    load();
  };

  const handleSaveWorkout = async (input: CreateWorkoutInput) => {
    try {
      await workoutApi.create(input, accessToken);
    } catch (error) {
      ignoreIfQueued(error);
    }
    setWorkoutModalOpen(false);
    load();
  };

  if (isLoading) return <Spinner />;
  if (loadError || !bodySummary) {
    return <p className={uiStyles.cardNote}>No se pudo cargar tu resumen de salud.</p>;
  }

  return (
    <div>
      <div className={uiStyles.periodNav}>
        <button
          type="button"
          className={uiStyles.iconOnlyButton}
          onClick={() => setWeekStart((d) => addWeeks(d, -1))}
          aria-label="Semana anterior"
        >
          <CaretLeftIcon />
        </button>
        <span className={uiStyles.periodNavLabel}>{formatWeekRangeLabel(weekStart)}</span>
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

      <div className={uiStyles.metricGrid2} style={{ margin: '0.9rem 0' }}>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Peso actual</p>
          <p className={uiStyles.bigStat}>
            {bodySummary.currentWeightKg !== null ? `${formatWeightKg(bodySummary.currentWeightKg)} kg` : 'Sin datos'}
          </p>
          {bodySummary.deltaVsPreviousPeriod !== null && (
            <p className={uiStyles.cardNote}>{formatSignedKg(bodySummary.deltaVsPreviousPeriod)} kg este mes</p>
          )}
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Sesiones</p>
          <p className={uiStyles.bigStat}>
            {scheduledCount > 0 ? `${weekWorkouts.length} de ${scheduledCount}` : weekWorkouts.length}
          </p>
          <p className={uiStyles.cardNote}>{formatAccumulatedDuration(totalDurationSeconds)} acumulados</p>
        </div>
      </div>

      <p className={uiStyles.sectionLabel} style={{ marginBottom: '0.5rem' }}>
        Tus módulos
      </p>

      <Link href="/salud/progreso" className={styles.moduleCard}>
        <div className={styles.moduleCardHeader}>
          <span className={styles.moduleIconBadge}>
            <ScaleIcon width={18} height={18} />
          </span>
          <div className={styles.moduleCardHeaderText}>
            <p className={styles.moduleCardTitle}>Progreso corporal</p>
            <p className={styles.moduleCardSubtitle}>Peso, medidas y evolución</p>
          </div>
          <CaretRightIcon width={14} height={14} className={styles.moduleCardChevron} />
        </div>
        <div className={styles.moduleCardBody}>
          {bodySummary.goal ? (
            <>
              <p className={uiStyles.bigStat}>
                {bodySummary.currentWeightKg !== null
                  ? `${formatWeightKg(bodySummary.currentWeightKg)} kg`
                  : 'Sin mediciones'}
              </p>
              {bodySummary.totalChangeSinceStart !== null && (
                <p className={uiStyles.cardNote}>{formatSignedKg(bodySummary.totalChangeSinceStart)} kg desde el inicio</p>
              )}
              {bodySummary.percentProgress !== null && (
                <div className={uiStyles.progressTrack} style={{ margin: '0.6rem 0' }}>
                  <div
                    className={uiStyles.progressFill}
                    style={{ transform: `scaleX(${Math.min(Math.max(bodySummary.percentProgress, 0), 100) / 100})` }}
                  />
                </div>
              )}
              <div className={styles.goalRow}>
                <span>Inicio: {formatWeightKg(bodySummary.goal.startWeightKg)} kg</span>
                <span>
                  Meta:{' '}
                  {bodySummary.goal.targetWeightKg !== null ? `${formatWeightKg(bodySummary.goal.targetWeightKg)} kg` : '—'}
                </span>
              </div>
            </>
          ) : (
            <p className={uiStyles.cardNote}>Fija una meta en Progreso corporal para ver tu avance aquí.</p>
          )}
        </div>
      </Link>

      <Link href="/salud/entrenamientos" className={styles.moduleCard}>
        <div className={styles.moduleCardHeader}>
          <span className={styles.moduleIconBadge}>
            <BarbellIcon width={18} height={18} />
          </span>
          <div className={styles.moduleCardHeaderText}>
            <p className={styles.moduleCardTitle}>Entrenamientos</p>
            <p className={styles.moduleCardSubtitle}>Rutinas, sesiones y rendimiento</p>
          </div>
          <CaretRightIcon width={14} height={14} className={styles.moduleCardChevron} />
        </div>
        <div className={styles.moduleCardBody}>
          {hasLoggedToday ? (
            <p className={uiStyles.cardNote}>Ya registraste tu entrenamiento de hoy.</p>
          ) : todayRoutine ? (
            <>
              <p className={uiStyles.cardNote}>{WEEKDAY_FULL_LABELS[todayWeekday]} · Tu próximo entrenamiento programado</p>
              <p className={uiStyles.bigStat} style={{ fontSize: '1.15rem', margin: '0.3rem 0 0.2rem' }}>
                {todayRoutine.name}
              </p>
              <p className={uiStyles.cardNote}>{todayRoutine.exercises.length} ejercicios</p>
            </>
          ) : (
            <p className={uiStyles.cardNote}>Sin rutina programada para hoy.</p>
          )}
        </div>
      </Link>

      <p className={uiStyles.sectionLabel} style={{ margin: '1.1rem 0 0.5rem' }}>
        Acciones rápidas
      </p>
      <div className={styles.quickActions}>
        <button type="button" className={uiStyles.outlineButton} onClick={() => setMeasurementModalOpen(true)}>
          <ScaleIcon width={16} height={16} /> Registrar peso
        </button>
        <button
          type="button"
          className={`${uiStyles.modalPrimaryButton} ${styles.quickActionPrimary}`}
          onClick={() => setWorkoutModalOpen(true)}
        >
          <BarbellIcon width={16} height={16} /> Entrenar ahora
        </button>
      </div>

      {isMeasurementModalOpen && (
        <MeasurementModal onClose={() => setMeasurementModalOpen(false)} onSave={handleSaveMeasurement} />
      )}
      {isWorkoutModalOpen && (
        <NewWorkoutModal
          routines={routines}
          defaultDate={today}
          onClose={() => setWorkoutModalOpen(false)}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  );
}
