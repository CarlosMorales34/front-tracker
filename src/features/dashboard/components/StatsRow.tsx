import { DashboardData } from '../types/dashboard.types';
import { formatCurrency } from '../utils/format';
import styles from './dashboard.module.css';

interface StatsRowProps {
  monthlyBalance: DashboardData['monthlyBalance'];
  currentWeight: DashboardData['currentWeight'];
}

export function StatsRow({ monthlyBalance, currentWeight }: StatsRowProps) {
  const weightDiff = Math.abs(currentWeight.kg - currentWeight.goalKg);
  const weightNote =
    currentWeight.kg > currentWeight.goalKg
      ? `Meta ${currentWeight.goalKg} kg · faltan ${weightDiff} kg`
      : `Meta ${currentWeight.goalKg} kg · alcanzada`;

  return (
    <div className={styles.statsRow}>
      <section className={styles.card}>
        <p className={styles.cardLabel}>Balance del mes</p>
        <p className={styles.bigStat}>{formatCurrency(monthlyBalance.amount)}</p>
        <p className={styles.cardNote}>
          ↗ Ingresos {formatCurrency(monthlyBalance.income)} · Gastos {formatCurrency(monthlyBalance.expenses)}
        </p>
      </section>
      <section className={styles.card}>
        <p className={styles.cardLabel}>Peso actual</p>
        <p className={styles.bigStat}>{currentWeight.kg} kg</p>
        <p className={styles.cardNote}>{weightNote}</p>
      </section>
    </div>
  );
}
