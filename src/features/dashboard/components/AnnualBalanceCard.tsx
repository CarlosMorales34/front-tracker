import { TrendUpIcon } from '../../../shared/components/icons/icons';
import { DashboardData } from '../types/dashboard.types';
import { formatCurrency } from '../utils/format';
import styles from './dashboard.module.css';

export function AnnualBalanceCard({ annualBalance }: { annualBalance: DashboardData['annualBalance'] }) {
  const yearsLabel = annualBalance.byYear.map((y) => `${y.year}: ${formatCurrency(y.amount)}`).join(' · ');

  return (
    <section className={styles.card}>
      <div className={styles.annualHeader}>
        <div>
          <p className={styles.cardLabel}>Balance anual vs. años anteriores</p>
          <p className={styles.bigStat}>{formatCurrency(annualBalance.amount)}</p>
        </div>
        <span className={styles.growthBadge}>
          <TrendUpIcon /> +{annualBalance.growthPercentVsPreviousYear}% vs {annualBalance.byYear[0]?.year}
        </span>
      </div>
      <p className={styles.cardNote}>{yearsLabel}</p>
    </section>
  );
}
