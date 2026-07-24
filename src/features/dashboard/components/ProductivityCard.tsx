import { DashboardData } from '../types/dashboard.types';
import { ProgressBar } from './ProgressBar';
import styles from './dashboard.module.css';

export function ProductivityCard({ productivity }: { productivity: DashboardData['productivity'] }) {
  return (
    <section className={styles.card}>
      <p className={styles.cardLabel}>Productividad de la semana</p>
      <p className={styles.bigStat}>
        {productivity.percent}%{' '}
        <span className={styles.bigStatCaption}>de tu meta de {productivity.goalHours} hrs productivas</span>
      </p>
      <ProgressBar percent={productivity.percent} />
      <p className={styles.cardNote}>{productivity.note}</p>
    </section>
  );
}
