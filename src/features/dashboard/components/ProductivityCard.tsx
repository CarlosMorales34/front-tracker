import Link from 'next/link';
import { ProgressBar } from './ProgressBar';
import styles from './dashboard.module.css';

interface ProductivityCardProps {
  percent: number | null;
  hasData: boolean;
}

export function ProductivityCard({ percent, hasData }: ProductivityCardProps) {
  return (
    <Link href="/actividades" className={styles.card} data-tour="dashboard-productivity">
      <p className={styles.cardLabel}>Productividad de la semana</p>
      {hasData && percent !== null ? (
        <>
          <p className={styles.bigStat}>{percent}%</p>
          <ProgressBar percent={percent} />
        </>
      ) : (
        <p className={styles.cardNote}>
          Estamos conociéndote para ayudarte a mejorar. Registra actividades en Actividades diarias esta semana para
          ver tu productividad.
        </p>
      )}
    </Link>
  );
}
