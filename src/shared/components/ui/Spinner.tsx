import styles from './ui.module.css';

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Cargando…' }: SpinnerProps) {
  return (
    <div className={styles.spinnerWrap} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className={styles.spinnerLabel}>{label}</span>
    </div>
  );
}
