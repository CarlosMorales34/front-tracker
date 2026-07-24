import { Fragment } from 'react';
import { Activity, Category, DayChip } from '../types/activities.types';
import { formatHours, sumHours } from '../utils/hours';
import styles from './activities.module.css';

interface WeeklyTableProps {
  days: DayChip[];
  categories: Category[];
  activities: Activity[];
  productiveHoursByDay: number[];
}

// Tabla ancha (8 columnas: actividad + 7 días + total) -- en mobile no cabe,
// así que el wrapper hace scroll horizontal con la primera columna
// "pegada" (position: sticky) para no perder de vista qué actividad es cada
// fila mientras se desliza. Es la solución que pediste ("scroll o algo
// mejor") sin rediseñar la tabla para mobile.
export function WeeklyTable({ days, categories, activities, productiveHoursByDay }: WeeklyTableProps) {
  const grandTotal = productiveHoursByDay.reduce((sum, value) => sum + value, 0);

  return (
    <div className={styles.tableScrollWrap}>
      <table className={styles.weekTable}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>Actividad</th>
            {days.map((day) => (
              <th key={day.dateIso}>
                {day.weekdayLabel} {day.dayNumber}
              </th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const categoryActivities = activities.filter((activity) => activity.categoryId === category.id);
            const categoryTotal = sumHours(categoryActivities.map((activity) => sumHours(activity.weekHours)));

            return (
              <Fragment key={category.id}>
                <tr className={styles.categoryRow} style={{ '--cat-color': category.color } as React.CSSProperties}>
                  <th className={`${styles.stickyCol} ${styles.categoryRowLabel}`} colSpan={1}>
                    {category.name.toUpperCase()}
                  </th>
                  {days.map((day) => (
                    <td key={day.dateIso} />
                  ))}
                  <td className={styles.categoryRowTotal}>{formatHours(categoryTotal)}</td>
                </tr>
                {categoryActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className={styles.stickyCol}>{activity.name}</td>
                    {activity.weekHours.map((value, index) => (
                      <td key={days[index]?.dateIso ?? index}>{formatHours(value)}</td>
                    ))}
                    <td className={styles.weekTableTotalCell}>{formatHours(sumHours(activity.weekHours))}</td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
          <tr className={styles.productiveRow}>
            <th className={styles.stickyCol}>Horas productivas</th>
            {productiveHoursByDay.map((value, index) => (
              <td key={days[index]?.dateIso ?? index}>{value}</td>
            ))}
            <td>{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
