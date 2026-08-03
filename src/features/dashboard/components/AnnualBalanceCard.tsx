import Link from 'next/link';
import { TrendUpIcon } from '../../../shared/components/icons/icons';
import { DashboardData } from '../types/dashboard.types';
import { formatCurrency } from '../utils/format';
import styles from './dashboard.module.css';

interface AnnualBalanceCardProps {
  annualBalance: DashboardData['annualBalance'];
  hasData: boolean;
}

export function AnnualBalanceCard({ annualBalance, hasData }: AnnualBalanceCardProps) {
  if (!hasData) {
    return (
      <Link href="/finanzas" className={styles.card}>
        <p className={styles.cardLabel}>Balance anual vs. años anteriores</p>
        <p className={styles.cardNote}>
          Estamos conociéndote para ayudarte a mejorar. Registra ingresos y gastos en Finanzas a lo largo del año
          para comparar contra años anteriores.
        </p>
      </Link>
    );
  }

  const yearsLabel = annualBalance.byYear.map((y) => `${y.year}: ${formatCurrency(y.amount)}`).join(' · ');

  return (
    <Link href="/finanzas" className={styles.card}>
      <div className={styles.annualHeader}>
        <div>
          <p className={styles.cardLabel}>Balance anual vs. años anteriores</p>
          <p className={styles.bigStat}>{formatCurrency(annualBalance.amount)}</p>
        </div>
        {annualBalance.growthPercentVsPreviousYear !== null && annualBalance.byYear[0] && (
          <span className={styles.growthBadge}>
            <TrendUpIcon /> {annualBalance.growthPercentVsPreviousYear >= 0 ? '+' : ''}
            {annualBalance.growthPercentVsPreviousYear}% vs {annualBalance.byYear[0].year}
          </span>
        )}
      </div>
      {yearsLabel && <p className={styles.cardNote}>{yearsLabel}</p>}
    </Link>
  );
}
