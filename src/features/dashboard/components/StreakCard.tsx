import styles from './dashboard.module.css';

interface StreakCardProps {
  days: number;
  hasData: boolean;
}

export function StreakCard({ days, hasData }: StreakCardProps) {
  return (
    <section className={styles.card}>
      <p className={styles.cardLabel}>Racha activa</p>
      {hasData ? (
        <p className={styles.bigStat}>
          {days} <span className={styles.bigStatCaption}>días</span>
        </p>
      ) : (
        <p className={styles.cardNote}>
          Estamos conociéndote para ayudarte a mejorar. Registra al menos una actividad hoy para empezar tu racha.
        </p>
      )}
    </section>
  );
}
