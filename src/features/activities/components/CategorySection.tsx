import { ClockIcon, GripIcon, PlusIcon } from '../../../shared/components/icons/icons';
import { Activity, Category } from '../types/activities.types';
import { formatHours, sumHours } from '../utils/hours';
import styles from './activities.module.css';

interface CategorySectionProps {
  category: Category;
  activities: Activity[];
  onAddActivityClick: () => void;
}

export function CategorySection({ category, activities, onAddActivityClick }: CategorySectionProps) {
  const totalToday = sumHours(activities.map((activity) => activity.todayHours));

  return (
    <section style={{ '--cat-color': category.color } as React.CSSProperties}>
      <div className={styles.sectionHeader}>
        <span className={styles.categoryLabel}>
          <span className={styles.categoryDot} />
          {category.name}
        </span>
        <span className={styles.categoryTotal}>{formatHours(totalToday)}h hoy</span>
      </div>

      <div className={styles.plainList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityRow}>
            <GripIcon className={styles.gripHandle} />
            <span className={styles.activityName}>{activity.name}</span>
            <span className={styles.activityTimeField}>
              --:-- ----
              <ClockIcon />
            </span>
            <span className={styles.routineTimeDash}>–</span>
            <span className={styles.activityTimeField}>
              --:-- ----
              <ClockIcon />
            </span>
            <span className={styles.hoursBadge}>{formatHours(activity.todayHours)}</span>
          </div>
        ))}

        <button type="button" className={styles.addActivityButton} onClick={onAddActivityClick}>
          <PlusIcon /> Nueva actividad
        </button>
      </div>
    </section>
  );
}
