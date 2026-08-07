import { WeekDayChip } from '../../../shared/lib/week';
import styles from './weight.module.css';

interface WorkoutDayChipStripProps {
  days: WeekDayChip[];
  selectedDateIso: string;
  onSelect: (dateIso: string) => void;
}

export function WorkoutDayChipStrip({ days, selectedDateIso, onSelect }: WorkoutDayChipStripProps) {
  return (
    <div className={styles.dayChipStrip}>
      {days.map((day) => (
        <button
          key={day.dateIso}
          type="button"
          className={styles.dayChip}
          data-selected={day.dateIso === selectedDateIso}
          onClick={() => onSelect(day.dateIso)}
        >
          <span className={styles.dayChipWeekday}>{day.weekdayLabel}</span>
          <span className={styles.dayChipNumber}>{day.dayNumber}</span>
        </button>
      ))}
    </div>
  );
}
