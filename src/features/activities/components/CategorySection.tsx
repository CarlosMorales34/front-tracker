import { KeyboardEvent, useState } from 'react';
import { CaretDownIcon, ClockIcon, CloseIcon, PencilIcon, PlusIcon } from '../../../shared/components/icons/icons';
import { Activity, Category } from '../types/activities.types';
import { computeDurationHours, formatHours, sumHours } from '../utils/hours';
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
  onSaveHours: (activityId: string, hours: number | null) => Promise<void>;
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
  onSaveHours,
}: CategorySectionProps) {
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
                onSaveHours={(hours) => onSaveHours(activity.id, hours)}
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

// Igual criterio que RoutineRow: el editor de horas cae en su propia línea
// (no se aprieta junto al nombre en mobile), guarda con Enter o al perder
// foco, y las horas se calculan a partir del rango start/end (no se
// persisten los horarios en sí -- activity_logs solo guarda `hours`).
function ActivityRow({
  activity,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSaveHours,
}: {
  activity: Activity;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveHours: (hours: number | null) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const openEditor = () => {
    setStart('');
    setEnd('');
    setIsEditing(true);
  };

  const save = (nextStart: string, nextEnd: string) => {
    if (!nextStart || !nextEnd) return;
    const hours = computeDurationHours(nextStart, nextEnd);
    if (hours === null) return;
    void onSaveHours(hours);
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
          <span className={styles.hoursBadge}>
            {activity.todayHours !== null ? `${formatHours(activity.todayHours)}h` : '–'}
          </span>
        )}
        <button
          type="button"
          className={styles.iconOnlyButton}
          onClick={openEditor}
          aria-label={`Registrar horas de ${activity.name}`}
        >
          <PencilIcon width={16} height={16} />
        </button>
      </div>

      {isEditing && (
        <div className={styles.routineEditor}>
          <div className={styles.routineEditorRow}>
            <input
              type="time"
              className={styles.routineTimeInput}
              value={start}
              onChange={(event) => {
                setStart(event.target.value);
              }}
              onBlur={() => save(start, end)}
              onKeyDown={commitOnEnter}
              aria-label={`Hora de inicio ${activity.name}`}
            />
            <span className={styles.routineTimeDash}>–</span>
            <input
              type="time"
              className={styles.routineTimeInput}
              value={end}
              onChange={(event) => {
                setEnd(event.target.value);
              }}
              onBlur={() => save(start, end)}
              onKeyDown={commitOnEnter}
              aria-label={`Hora de fin ${activity.name}`}
            />
            <ClockIcon />
          </div>
          <div className={styles.routineEditorActions}>
            <span className={styles.cardNote}>
              {activity.todayHours !== null ? `Registrado: ${formatHours(activity.todayHours)}h` : 'Sin horas registradas'}
            </span>
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
