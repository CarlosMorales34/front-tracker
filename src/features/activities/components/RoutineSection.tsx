import { BriefcaseIcon, ClockIcon, MoonIcon, PlusIcon, SunIcon, TrashIcon } from '../../../shared/components/icons/icons';
import { FixedRoutine } from '../types/activities.types';
import styles from './activities.module.css';

const ROUTINE_ICONS: Record<string, typeof MoonIcon> = {
  moon: MoonIcon,
  sun: SunIcon,
  briefcase: BriefcaseIcon,
};

interface RoutineSectionProps {
  routines: FixedRoutine[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export function RoutineSection({ routines, onAddClick, onDelete }: RoutineSectionProps) {
  return (
    <section>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>Rutina fija de hoy</p>
        <button type="button" className={styles.iconOnlyButton} onClick={onAddClick} aria-label="Nueva rutina fija">
          <PlusIcon />
        </button>
      </div>

      {routines.length === 0 ? (
        <p className={styles.cardNote}>Todavía no tienes rutinas fijas. Crea la primera con el botón +.</p>
      ) : (
        <div className={styles.card}>
          {routines.map((routine) => (
            <RoutineRow key={routine.id} routine={routine} onDelete={() => onDelete(routine.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

// Layout: [ícono + nombre] centrado verticalmente junto a una columna de
// 1 línea (hora única) o 2 líneas (rango de horas, como "Trabajaste" con dos
// turnos) -- align-items:center en la fila logra el centrado automático sin
// necesidad de calcular alturas a mano. Todavía no existe el endpoint de
// registro por día (routine_logs), así que `times` viene vacío al listar
// desde la API -- se muestra un guion en vez de intentar renderizar horas.
function RoutineRow({ routine, onDelete }: { routine: FixedRoutine; onDelete: () => void }) {
  const Icon = ROUTINE_ICONS[routine.icon] ?? MoonIcon;

  return (
    <div className={styles.routineRow}>
      <div className={styles.routineLabel}>
        <span className={styles.routineIcon}>
          <Icon width={20} height={20} />
        </span>
        <span className={styles.routineName}>{routine.name}</span>
      </div>

      <div className={styles.routineTimes}>
        {routine.times.length === 0 ? (
          <span className={styles.routineTimeDash}>Sin horario registrado</span>
        ) : (
          routine.times.map((time, index) => (
            <div key={index} className={styles.routineTimeLine}>
              <span>{time.start}</span>
              <ClockIcon />
              {time.end && (
                <>
                  <span className={styles.routineTimeDash}>–</span>
                  <span>{time.end}</span>
                  <ClockIcon />
                </>
              )}
            </div>
          ))
        )}
      </div>

      <span className={styles.routineBar} aria-hidden />

      <button type="button" className={styles.iconOnlyButton} onClick={onDelete} aria-label={`Eliminar ${routine.name}`}>
        <TrashIcon />
      </button>
    </div>
  );
}
