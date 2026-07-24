import { CaretRightIcon } from '../../../shared/components/icons/icons';
import { WeekProductivity } from '../types/weekly-log.types';
import styles from './weekly-log.module.css';

interface WeeksListProps {
  weeks: WeekProductivity[];
  onSelectWeek: (weekNumber: number) => void;
}

// Solo semanas CON datos, más reciente primero -- igual que el mockup, no
// tiene sentido listar 52 filas vacías cuando el heatmap ya las muestra.
export function WeeksList({ weeks, onSelectWeek }: WeeksListProps) {
  const withData = weeks.filter((w) => w.percent !== null).slice().reverse();

  if (withData.length === 0) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Todavía no hay semanas con datos.</p>;
  }

  return (
    <div>
      {withData.map((week) => {
        const pct = Math.round(week.percent ?? 0);
        const pctColor = pct >= 85 ? 'var(--color-accent)' : pct >= 65 ? 'var(--color-text)' : 'var(--color-text-secondary)';
        return (
          <button key={week.weekNumber} type="button" className={styles.weekRow} onClick={() => onSelectWeek(week.weekNumber)}>
            <span className={styles.weekRowBar} style={{ background: `color-mix(in srgb, var(--color-accent) ${Math.max(10, pct)}%, var(--color-border))` }} />
            <span className={styles.weekRowNum}>Sem {week.weekNumber}</span>
            <span className={styles.weekRowRange}>{week.rangeLabel}</span>
            <span className={styles.weekRowPercent} style={{ color: pctColor }}>
              {pct}%
            </span>
            <CaretRightIcon className={styles.weekRowCaret} />
          </button>
        );
      })}
    </div>
  );
}
