import { CategoryHours } from '../types/dashboard.types';
import { ProgressBar } from './ProgressBar';
import styles from './dashboard.module.css';

// Escala de las barras: la más alta define el 100% del track (con un piso
// de 10h para que una sola categoría chica no se vea como barra llena).
export function CategoryHoursCard({ categories }: { categories: CategoryHours[] }) {
  const max = Math.max(10, ...categories.map((c) => c.hours));

  return (
    <section className={styles.card}>
      <p className={styles.cardLabel}>Horas por categoría</p>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <div key={category.label} className={styles.categoryRow}>
            <span className={styles.categoryLabel}>{category.label}</span>
            <div className={styles.categoryBarWrap}>
              <ProgressBar percent={(category.hours / max) * 100} />
            </div>
            <span className={styles.categoryValue}>{category.hours}h</span>
          </div>
        ))}
      </div>
    </section>
  );
}
