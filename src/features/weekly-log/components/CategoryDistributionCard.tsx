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
            <span className={styles.distributionLabel}>
              <span className={styles.detailCatDot} style={{ background: category.color }} />
              <span>{category.name}</span>
            </span>
            <div className={uiStyles.progressTrack} style={{ flex: 1 }}>
              <div
                className={uiStyles.progressFill}
                style={{
                  transform: `scaleX(${Math.min(Math.max(category.percent, 0), 100) / 100})`,
                  background: category.color,
                }}
              />
            </div>
            <span className={styles.distributionValue}>{Math.round(category.percent)}%</span>
          </div>
        ))
      )}
    </div>
  );
}
