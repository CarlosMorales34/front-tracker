import { PencilIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import { WEEKDAY_FULL_LABELS } from '../../../shared/lib/week';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WorkoutRoutine } from '../types/workout.types';
import styles from './weight.module.css';

interface RoutinesSectionProps {
  routines: WorkoutRoutine[];
  onAddClick: () => void;
  onEdit: (routine: WorkoutRoutine) => void;
  onDelete: (routine: WorkoutRoutine) => void;
}

// Plantillas fijas (ej. "Día de pierna") -- se reutilizan desde el selector
// "Usar rutina" de Nuevo entrenamiento, esta sección solo administra el
// catálogo (crear/editar/borrar).
export function RoutinesSection({ routines, onAddClick, onEdit, onDelete }: RoutinesSectionProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div className={styles.workoutsHeader}>
        <p className={styles.workoutsHeaderTitle}>Rutinas</p>
        <button type="button" className={styles.addWorkoutButton} onClick={onAddClick}>
          <PlusIcon /> Nueva rutina
        </button>
      </div>

      {routines.length === 0 ? (
        <p className={styles.workoutsEmptyState}>Sin rutinas todavía. Crea una para reutilizarla al registrar un entrenamiento.</p>
      ) : (
        routines.map((routine) => (
          <div key={routine.id} className={`${uiStyles.card} ${styles.workoutCard}`}>
            <div className={styles.workoutCardTop}>
              <div>
                <p className={styles.routineNameLabel}>{routine.name}</p>
                {routine.exercises.map((exercise) => (
                  <p key={exercise.id} className={styles.exerciseLine}>
                    <strong>{exercise.name}</strong> · {exercise.targetSets}x{exercise.targetReps}
                    {exercise.suggestedWeight !== null ? ` @ ${exercise.suggestedWeight} lbs` : ''}
                  </p>
                ))}
              </div>
              <div className={styles.workoutMeta}>
                {routine.weekday !== null && (
                  <span className={styles.durationTag}>{WEEKDAY_FULL_LABELS[routine.weekday]}</span>
                )}
                <button
                  type="button"
                  className={uiStyles.iconInlineButton}
                  onClick={() => onEdit(routine)}
                  aria-label={`Editar ${routine.name}`}
                >
                  <PencilIcon width={14} height={14} />
                </button>
                <button
                  type="button"
                  className={uiStyles.iconInlineButton}
                  onClick={() => onDelete(routine)}
                  aria-label={`Eliminar ${routine.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
