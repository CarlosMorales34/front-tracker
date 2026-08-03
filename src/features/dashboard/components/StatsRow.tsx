import Link from 'next/link';
import { DashboardData } from '../types/dashboard.types';
import { formatCurrency } from '../utils/format';
import styles from './dashboard.module.css';

interface StatsRowProps {
  monthlyBalance: DashboardData['monthlyBalance'];
  monthlyBalanceHasData: boolean;
  currentWeightKg: number | null;
  weightGoalKg: number;
  currentWeightHasData: boolean;
}

export function StatsRow({
  monthlyBalance,
  monthlyBalanceHasData,
  currentWeightKg,
  weightGoalKg,
  currentWeightHasData,
}: StatsRowProps) {
  const weightNote = (() => {
    if (currentWeightKg === null) return '';
    const diff = Math.abs(currentWeightKg - weightGoalKg);
    return currentWeightKg > weightGoalKg
      ? `Meta ${weightGoalKg} kg · faltan ${diff.toFixed(2)} kg`
      : currentWeightKg < weightGoalKg
        ? `Meta ${weightGoalKg} kg · faltan ${diff.toFixed(2)} kg`
        : `Meta ${weightGoalKg} kg · alcanzada`;
  })();

  return (
    <div className={styles.statsRow}>
      <Link href="/finanzas" className={styles.card}>
        <p className={styles.cardLabel}>Balance del mes</p>
        {monthlyBalanceHasData ? (
          <>
            <p className={styles.bigStat}>{formatCurrency(monthlyBalance.amount)}</p>
            <p className={styles.cardNote}>
              ↗ Ingresos {formatCurrency(monthlyBalance.income)} · Gastos {formatCurrency(monthlyBalance.expenses)}
            </p>
          </>
        ) : (
          <p className={styles.cardNote}>Registra ingresos o gastos en Finanzas para ver tu balance del mes.</p>
        )}
      </Link>
      <Link href="/peso" className={styles.card}>
        <p className={styles.cardLabel}>Peso actual</p>
        {currentWeightHasData && currentWeightKg !== null ? (
          <>
            <p className={styles.bigStat}>{currentWeightKg} kg</p>
            <p className={styles.cardNote}>{weightNote}</p>
          </>
        ) : (
          <p className={styles.cardNote}>Registra tu peso en Peso mensual para verlo aquí.</p>
        )}
      </Link>
    </div>
  );
}
