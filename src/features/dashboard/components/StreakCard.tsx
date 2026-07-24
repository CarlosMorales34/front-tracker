import { DashboardData } from '../types/dashboard.types';
import styles from './dashboard.module.css';

export function StreakCard({ streak }: { streak: DashboardData['streak'] }) {
  return (
    <section className={styles.card}>
      <p className={styles.cardLabel}>Racha activa</p>
      <p className={styles.bigStat}>
        {streak.days} <span className={styles.bigStatCaption}>días</span>
      </p>
      <p className={styles.cardNote}>{streak.note}</p>
    </section>
  );
}
