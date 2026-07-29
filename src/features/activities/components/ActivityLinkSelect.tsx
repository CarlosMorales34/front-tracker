import { Activity, Category } from '../types/activities.types';
import styles from './activities.module.css';

interface ActivityLinkSelectProps {
  categories: Category[];
  activities: Activity[];
  value: string | null;
  onChange: (activityId: string | null) => void;
}

// Selector compartido por NewRoutineModal/EditRoutineModal: agrupa las
// actividades por categoría (igual jerarquía que se ve en la vista de
// Actividades diarias) para que sea fácil ubicar la actividad correcta sin
// tener que memorizar ids.
export function ActivityLinkSelect({ categories, activities, value, onChange }: ActivityLinkSelectProps) {
  return (
    <label className={styles.modalLabel}>
      Vincular a actividad (opcional)
      <select className={styles.modalInput} value={value ?? ''} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">Sin vincular</option>
        {categories.map((category) => {
          const categoryActivities = activities.filter((activity) => activity.categoryId === category.id);
          if (categoryActivities.length === 0) return null;
          return (
            <optgroup key={category.id} label={category.name}>
              {categoryActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
