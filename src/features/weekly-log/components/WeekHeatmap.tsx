import { WeekProductivity } from '../types/weekly-log.types';
import { heatColor } from '../utils/format';
import styles from './weekly-log.module.css';

interface WeekHeatmapProps {
  weeks: WeekProductivity[];
  onSelectWeek: (weekNumber: number) => void;
}

export function WeekHeatmap({ weeks, onSelectWeek }: WeekHeatmapProps) {
  return (
    <div className={styles.heatmap}>
      {weeks.map((week) => (
        <button
          key={week.weekNumber}
          type="button"
          className={styles.heatCell}
          style={{ background: heatColor(week.percent) }}
          disabled={week.percent === null}
          onClick={() => onSelectWeek(week.weekNumber)}
          title={week.percent === null ? `Semana ${week.weekNumber}: sin datos` : `Semana ${week.weekNumber}: ${Math.round(week.percent)}%`}
        />
      ))}
    </div>
  );
}
