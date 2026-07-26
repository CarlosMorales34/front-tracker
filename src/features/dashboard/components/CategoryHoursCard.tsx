import { CategoryHours } from '../types/dashboard.types';
import { ProgressBar } from './ProgressBar';
import styles from './dashboard.module.css';

// Escala de las barras: la más alta define el 100% del track (con un piso
// de 10h para que una sola categoría chica no se vea como barra llena).
export function CategoryHoursCard({ categories }: { categories: CategoryHours[] }) {
  if (categories.length === 0) {
    return (
      <section className={styles.card} data-tour="dashboard-category-hours">
        <p className={styles.cardLabel}>Horas por categoría</p>
        <p className={styles.cardNote}>
          Estamos conociéndote para ayudarte a mejorar. Crea categorías y registra actividades para ver esta
          sección.
        </p>
      </section>
    );
  }

  const max = Math.max(10, ...categories.map((c) => c.hours));

  return (
    <section className={styles.card} data-tour="dashboard-category-hours">
      <p className={styles.cardLabel}>Horas por categoría</p>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <div key={category.categoryId} className={styles.categoryRow}>
            <span className={styles.categoryLabel}>{category.name}</span>
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
