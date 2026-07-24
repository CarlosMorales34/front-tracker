import styles from './dashboard.module.css';

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <div className={styles.progressTrack} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.progressFill} style={{ width: `${clamped}%` }} />
    </div>
  );
}
