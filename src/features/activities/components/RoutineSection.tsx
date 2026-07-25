import { KeyboardEvent, useState } from 'react';
import {
  BriefcaseIcon,
  ClockIcon,
  CloseIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
  TrashIcon,
} from '../../../shared/components/icons/icons';
import { FixedRoutine, RoutineTimeRange, RoutineType } from '../types/activities.types';
import { computeDurationHours, formatHours, sumHours } from '../utils/hours';
import styles from './activities.module.css';
import { EditRoutineModal } from './EditRoutineModal';

const ROUTINE_ICONS: Record<string, typeof MoonIcon> = {
  moon: MoonIcon,
  sun: SunIcon,
  briefcase: BriefcaseIcon,
};

interface RoutineSectionProps {
  routines: FixedRoutine[];
  selectedDateIso: string;
  onAddClick: () => void;
  onDelete: (id: string) => void;
  onSaveTimes: (id: string, times: RoutineTimeRange[]) => Promise<void>;
  onUpdateRoutine: (id: string, changes: { name?: string; type?: RoutineType }) => Promise<void>;
}

export function RoutineSection({
  routines,
  selectedDateIso,
  onAddClick,
  onDelete,
  onSaveTimes,
  onUpdateRoutine,
}: RoutineSectionProps) {
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
            <RoutineRow
              key={`${routine.id}-${selectedDateIso}`}
              routine={routine}
              onDelete={() => onDelete(routine.id)}
              onSaveTimes={(times) => onSaveTimes(routine.id, times)}
              onUpdateRoutine={(changes) => onUpdateRoutine(routine.id, changes)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface DraftTime {
  start: string;
  end: string;
}

function toDraft(times: RoutineTimeRange[]): DraftTime[] {
  if (times.length === 0) return [{ start: '', end: '' }];
  return times.map((time) => ({ start: time.start, end: time.end ?? '' }));
}

function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.blur();
  }
}

// Duración total de los turnos de una rutina "range" (ej. Dormir:
// acostarse/despertarse). overnight=true trata un end <= start como que
// cruzó medianoche en vez de un rango inválido -- necesario para dormir.
function totalDurationHours(times: RoutineTimeRange[]): number | null {
  const durations = times
    .filter((time) => time.end)
    .map((time) => computeDurationHours(time.start, time.end!, true));
  return sumHours(durations);
}

// Layout: [ícono + nombre] centrado verticalmente junto a una columna de
// 1 línea (hora única) o 2 líneas (rango de horas, como "Trabajaste" con dos
// turnos) -- align-items:center en la fila logra el centrado automático sin
// necesidad de calcular alturas a mano. El lápiz abre un editor inline con
// <input type="time">: guarda al perder foco o con Enter (mismo criterio que
// Peso), y "+ Agregar turno" solo aplica a type=range.
function RoutineRow({
  routine,
  onDelete,
  onSaveTimes,
  onUpdateRoutine,
}: {
  routine: FixedRoutine;
  onDelete: () => void;
  onSaveTimes: (times: RoutineTimeRange[]) => Promise<void>;
  onUpdateRoutine: (changes: { name?: string; type?: RoutineType }) => Promise<void>;
}) {
  const Icon = ROUTINE_ICONS[routine.icon] ?? MoonIcon;
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [draft, setDraft] = useState<DraftTime[]>(() => toDraft(routine.times));

  // Nota: no hay useEffect que sincronice `draft`/`isEditing` con
  // routine.times en cada cambio -- el único cambio de routine.times durante
  // la vida de esta fila es el guardado que ESTE editor dispara, y cerrarlo
  // en respuesta a su propio guardado expulsaba al usuario del editor tras
  // cada blur. El cambio de día ya remonta la fila entera (key en
  // RoutineSection incluye selectedDateIso), así que el estado local parte
  // limpio en ese caso sin necesidad de este efecto.
  const openEditor = () => {
    setDraft(toDraft(routine.times));
    setIsEditing(true);
  };

  const updateRow = (index: number, field: keyof DraftTime, value: string) => {
    setDraft((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const cleanedTimes = (rows: DraftTime[]): RoutineTimeRange[] =>
    rows
      .filter((row) => row.start)
      .map((row) => ({ start: row.start, end: routine.type === 'range' && row.end ? row.end : null }));

  const save = (rows: DraftTime[]) => {
    void onSaveTimes(cleanedTimes(rows));
  };

  const addRow = () => setDraft((prev) => [...prev, { start: '', end: '' }]);

  const removeRow = (index: number) => {
    const next = draft.filter((_, rowIndex) => rowIndex !== index);
    setDraft(next.length > 0 ? next : [{ start: '', end: '' }]);
    save(next);
  };

  const duration = routine.type === 'range' ? totalDurationHours(routine.times) : null;

  return (
    <div className={styles.routineRow}>
      <div className={styles.routineRowTop}>
        <div className={styles.routineLabel}>
          <span className={styles.routineIcon}>
            <Icon width={20} height={20} />
          </span>
          <span className={styles.routineName}>{routine.name}</span>
        </div>

        {!isEditing && (
          <div className={styles.routineTimes}>
            {routine.times.length === 0 ? (
              <span className={styles.routineTimeDash}>Sin horario registrado</span>
            ) : (
              <>
                {routine.times.map((time, index) => (
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
                ))}
                {duration !== null && (
                  <span className={styles.hoursBadge}>{formatHours(duration)}h</span>
                )}
              </>
            )}
          </div>
        )}

        <span className={styles.routineBar} aria-hidden />

        {!isEditing && (
          <>
            <button
              type="button"
              className={styles.iconOnlyButton}
              onClick={() => setIsEditingRoutine(true)}
              aria-label={`Editar rutina ${routine.name}`}
            >
              <SettingsIcon width={16} height={16} />
            </button>
            <button type="button" className={styles.iconOnlyButton} onClick={openEditor} aria-label={`Editar horario de ${routine.name}`}>
              <PencilIcon width={16} height={16} />
            </button>
          </>
        )}
        <button type="button" className={styles.iconOnlyButton} onClick={onDelete} aria-label={`Eliminar ${routine.name}`}>
          <TrashIcon />
        </button>
      </div>

      {isEditing && (
        <div className={styles.routineEditor}>
          {draft.map((row, index) => (
            <div key={index} className={styles.routineEditorRow}>
              <input
                type="time"
                className={styles.routineTimeInput}
                value={row.start}
                onChange={(event) => updateRow(index, 'start', event.target.value)}
                onBlur={() => save(draft)}
                onKeyDown={commitOnEnter}
                aria-label={`Hora de inicio ${routine.name}`}
              />
              {routine.type === 'range' && (
                <>
                  <span className={styles.routineTimeDash}>–</span>
                  <input
                    type="time"
                    className={styles.routineTimeInput}
                    value={row.end}
                    onChange={(event) => updateRow(index, 'end', event.target.value)}
                    onBlur={() => save(draft)}
                    onKeyDown={commitOnEnter}
                    aria-label={`Hora de fin ${routine.name}`}
                  />
                </>
              )}
              {routine.type === 'range' && draft.length > 1 && (
                <button
                  type="button"
                  className={styles.iconOnlyButton}
                  onClick={() => removeRow(index)}
                  aria-label="Quitar turno"
                >
                  <TrashIcon width={14} height={14} />
                </button>
              )}
            </div>
          ))}
          <div className={styles.routineEditorActions}>
            {routine.type === 'range' && (
              <button type="button" className={styles.routineAddTurnButton} onClick={addRow}>
                <PlusIcon width={14} height={14} /> Agregar turno
              </button>
            )}
            <button
              type="button"
              className={styles.iconOnlyButton}
              onClick={() => setIsEditing(false)}
              aria-label="Cerrar editor de horario"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        </div>
      )}

      {isEditingRoutine && (
        <EditRoutineModal
          routine={routine}
          onClose={() => setIsEditingRoutine(false)}
          onSave={async (changes) => {
            await onUpdateRoutine(changes);
            setIsEditingRoutine(false);
          }}
        />
      )}
    </div>
  );
}
