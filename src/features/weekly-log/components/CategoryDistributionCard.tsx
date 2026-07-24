import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CategoryDistribution } from '../types/weekly-log.types';
import styles from './weekly-log.module.css';

export function CategoryDistributionCard({ categories }: { categories: CategoryDistribution[] }) {
  return (
    <div className={uiStyles.card}>
      <p className={uiStyles.cardLabel} style={{ marginBottom: '0.75rem' }}>
        Distribución anual por categoría
      </p>
      {categories.length === 0 ? (
        <p className={uiStyles.cardNote}>Sin categorías todavía.</p>
      ) : (
        categories.map((category) => (
          <div key={category.categoryId} className={styles.distributionRow}>
            <span className={styles.distributionLabel}>{category.name}</span>
            <span className={uiStyles.progressTrack} style={{ flex: 1 }}>
              <span className={uiStyles.progressFill} style={{ width: `${category.percent}%`, background: category.color }} />
            </span>
            <span className={styles.distributionValue}>{Math.round(category.percent)}%</span>
          </div>
        ))
      )}
    </div>
  );
}
