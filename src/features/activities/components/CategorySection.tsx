import { KeyboardEvent, useState } from 'react';
import { CaretDownIcon, ClockIcon, CloseIcon, PencilIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import { Activity, ActivityTimeRange, Category } from '../types/activities.types';
import { formatHours, sumHours } from '../utils/hours';
import styles from './activities.module.css';

interface CategorySectionProps {
  category: Category;
  activities: Activity[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddActivityClick: () => void;
  canMoveCategoryUp: boolean;
  canMoveCategoryDown: boolean;
  onMoveCategory: (direction: 'up' | 'down') => void;
  onMoveActivity: (activityId: string, direction: 'up' | 'down') => void;
  onSaveTimes: (activityId: string, times: { start: string; end: string }[]) => Promise<void>;
  onDeleteCategory: () => void;
  onDeleteActivity: (activityId: string) => void;
}

export function CategorySection({
  category,
  activities,
  isCollapsed,
  onToggleCollapse,
  onAddActivityClick,
  canMoveCategoryUp,
  canMoveCategoryDown,
  onMoveCategory,
  onMoveActivity,
  onSaveTimes,
  onDeleteCategory,
  onDeleteActivity,
}: CategorySectionProps) {
  const handleDeleteCategory = () => {
    // Borrar una categoría se lleva todas sus actividades (cascade en DB) --
    // confirm explícito porque el blast radius es mucho mayor que borrar una
    // sola actividad o rutina.
    const activityCount = activities.length;
    const warning =
      activityCount > 0
        ? `Esto borrará "${category.name}" y sus ${activityCount} actividad${activityCount === 1 ? '' : 'es'} (con todo su historial de horas). ¿Continuar?`
        : `¿Borrar la categoría "${category.name}"?`;
    if (window.confirm(warning)) onDeleteCategory();
  };
  const totalToday = sumHours(activities.map((activity) => activity.todayHours));

  return (
    <section style={{ '--cat-color': category.color } as React.CSSProperties}>
      <div className={styles.sectionHeader}>
        <button type="button" className={styles.categoryToggle} onClick={onToggleCollapse}>
          <CaretDownIcon className={styles.categoryCollapseIcon} data-collapsed={isCollapsed} />
          <span className={styles.categoryLabel}>
            <span className={styles.categoryDot} />
            {category.name}
          </span>
        </button>
        <div className={styles.categoryHeaderRight}>
          <span className={styles.categoryTotal}>{formatHours(totalToday)}h hoy</span>
          <div className={styles.reorderButtons}>
            <button
              type="button"
              className={styles.iconOnlyButton}
              disabled={!canMoveCategoryUp}
              onClick={() => onMoveCategory('up')}
              aria-label={`Mover ${category.name} arriba`}
            >
              <CaretDownIcon className={styles.caretUp} />
            </button>
            <button
              type="button"
              className={styles.iconOnlyButton}
              disabled={!canMoveCategoryDown}
              onClick={() => onMoveCategory('down')}
              aria-label={`Mover ${category.name} abajo`}
            >
              <CaretDownIcon />
            </button>
          </div>
          <button
            type="button"
            className={styles.iconOnlyButton}
            onClick={handleDeleteCategory}
            aria-label={`Eliminar categoría ${category.name}`}
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className={styles.plainList}>
          {activities.map((activity, index) => (
            <div key={activity.id} data-tour="activities-activity-row">
              <ActivityRow
                activity={activity}
                canMoveUp={index > 0}
                canMoveDown={index < activities.length - 1}
                onMoveUp={() => onMoveActivity(activity.id, 'up')}
                onMoveDown={() => onMoveActivity(activity.id, 'down')}
                onSaveTimes={(times) => onSaveTimes(activity.id, times)}
                onDelete={() => onDeleteActivity(activity.id)}
              />
            </div>
          ))}

          <button
            type="button"
            className={styles.addActivityButton}
            onClick={onAddActivityClick}
            data-tour="activities-add-activity-button"
          >
            <PlusIcon /> Nueva actividad
          </button>
        </div>
      )}
    </section>
  );
}

function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.blur();
  }
}

interface DraftTime {
  start: string;
  end: string;
}

// Solo los turnos manuales entran al editor -- los reflejados de una rutina
// vinculada (source='routine') se muestran aparte, de solo lectura, porque
// se editan desde la rutina (ver RoutineRow) y no desde acá.
function toManualDraft(times: ActivityTimeRange[]): DraftTime[] {
  const manual = times.filter((time) => time.source === 'manual').map((time) => ({ start: time.start, end: time.end }));
  return manual.length === 0 ? [{ start: '', end: '' }] : manual;
}

// Mismo criterio que RoutineRow: una actividad puede tener varios turnos por
// día (ej. Entretenimiento 13:00-14:00 y 19:00-21:00), el editor guarda con
// Enter o al perder foco, y el total se recalcula del lado del servidor a
// partir de todos los turnos (manuales + los que llegan de una rutina
// vinculada, si aplica).
function ActivityRow({
  activity,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSaveTimes,
  onDelete,
}: {
  activity: Activity;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveTimes: (times: { start: string; end: string }[]) => Promise<void>;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DraftTime[]>(() => toManualDraft(activity.todayTimes));

  const routineTimes = activity.todayTimes.filter((time) => time.source === 'routine');

  const openEditor = () => {
    setDraft(toManualDraft(activity.todayTimes));
    setIsEditing(true);
  };

  const updateRow = (index: number, field: keyof DraftTime, value: string) => {
    setDraft((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const cleanedTimes = (rows: DraftTime[]): { start: string; end: string }[] =>
    rows.filter((row) => row.start && row.end).map((row) => ({ start: row.start, end: row.end }));

  const save = (rows: DraftTime[]) => {
    void onSaveTimes(cleanedTimes(rows));
  };

  const addRow = () => setDraft((prev) => [...prev, { start: '', end: '' }]);

  const removeRow = (index: number) => {
    const next = draft.filter((_, rowIndex) => rowIndex !== index);
    setDraft(next.length > 0 ? next : [{ start: '', end: '' }]);
    save(next);
  };

  return (
    <div className={styles.activityRow}>
      <div className={styles.activityRowTop}>
        <div className={styles.reorderButtons}>
          <button
            type="button"
            className={styles.iconOnlyButton}
            disabled={!canMoveUp}
            onClick={onMoveUp}
            aria-label={`Mover ${activity.name} arriba`}
          >
            <CaretDownIcon className={styles.caretUp} />
          </button>
          <button
            type="button"
            className={styles.iconOnlyButton}
            disabled={!canMoveDown}
            onClick={onMoveDown}
            aria-label={`Mover ${activity.name} abajo`}
          >
            <CaretDownIcon />
          </button>
        </div>
        <span className={styles.activityName}>{activity.name}</span>

        {!isEditing && (
          <div className={styles.routineTimes}>
            {activity.todayTimes.length === 0 ? (
              <span className={styles.routineTimeDash}>Sin horas registradas</span>
            ) : (
              <>
                {activity.todayTimes.map((time, index) => (
                  <div key={index} className={styles.routineTimeLine}>
                    <span>{time.start}</span>
                    <ClockIcon />
                    <span className={styles.routineTimeDash}>–</span>
                    <span>{time.end}</span>
                    <ClockIcon />
                    {time.source === 'routine' && (
                      <span className={styles.cardNote}>({time.routineName})</span>
                    )}
                  </div>
                ))}
                <span className={styles.hoursBadge}>{formatHours(activity.todayHours)}h</span>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          className={styles.iconOnlyButton}
          onClick={openEditor}
          aria-label={`Registrar horas de ${activity.name}`}
        >
          <PencilIcon width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.iconOnlyButton}
          onClick={onDelete}
          aria-label={`Eliminar ${activity.name}`}
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>

      {isEditing && (
        <div className={styles.routineEditor}>
          {routineTimes.length > 0 && (
            <p className={styles.cardNote}>
              {routineTimes.map((time, index) => (
                <span key={index}>
                  {time.start}–{time.end} · {time.routineName} (vinculado, se edita desde la rutina)
                  {index < routineTimes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}

          {draft.map((row, index) => (
            <div key={index} className={styles.routineEditorRow}>
              <input
                type="time"
                className={styles.routineTimeInput}
                value={row.start}
                onChange={(event) => updateRow(index, 'start', event.target.value)}
                onBlur={() => save(draft)}
                onKeyDown={commitOnEnter}
                aria-label={`Hora de inicio ${activity.name}`}
              />
              <span className={styles.routineTimeDash}>–</span>
              <input
                type="time"
                className={styles.routineTimeInput}
                value={row.end}
                onChange={(event) => updateRow(index, 'end', event.target.value)}
                onBlur={() => save(draft)}
                onKeyDown={commitOnEnter}
                aria-label={`Hora de fin ${activity.name}`}
              />
              {draft.length > 1 && (
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
            <button type="button" className={styles.routineAddTurnButton} onClick={addRow}>
              <PlusIcon width={14} height={14} /> Agregar turno
            </button>
            <button
              type="button"
              className={styles.iconOnlyButton}
              onClick={() => setIsEditing(false)}
              aria-label="Cerrar registro de horas"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
