'use client';

import { useState } from 'react';
import { ChartBarIcon } from '../../../shared/components/icons/icons';
import { Category } from '../types/activities.types';
import { formatHours } from '../utils/hours';
import styles from './activities.module.css';

interface CategoryDistributionCardProps {
  categories: Category[];
  totalsByCategory: Record<string, number | null>;
}

export function CategoryDistributionCard({ categories, totalsByCategory }: CategoryDistributionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const max = Math.max(10, ...Object.values(totalsByCategory).map((value) => value ?? 0));

  return (
    <div>
      <button type="button" className={styles.outlineButton} onClick={() => setIsOpen((prev) => !prev)}>
        <ChartBarIcon /> {isOpen ? 'Ocultar distribución' : 'Ver distribución por categoría'}
      </button>

      {isOpen && (
        <div className={`${styles.card} ${styles.distributionCard}`}>
          <p className={styles.sectionLabelInline}>Distribución de horas por categoría (semana)</p>
          <div className={styles.distributionList}>
            {categories.map((category) => {
              const value = totalsByCategory[category.id] ?? null;
              const percent = value ? Math.min((value / max) * 100, 100) : 0;
              return (
                <div key={category.id} className={styles.distributionRow} style={{ '--cat-color': category.color } as React.CSSProperties}>
                  <span className={styles.distributionLabel}>{category.name}</span>
                  <div className={styles.progressTrack}>
                    <div className={styles.distributionFill} style={{ width: `${percent}%` }} />
                  </div>
                  <span className={styles.distributionValue}>{formatHours(value)}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
