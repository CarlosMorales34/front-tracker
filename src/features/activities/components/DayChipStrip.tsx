import { DayChip } from '../types/activities.types';
import styles from './activities.module.css';

interface DayChipStripProps {
  days: DayChip[];
  selectedDateIso: string;
  onSelect: (dateIso: string) => void;
}

export function DayChipStrip({ days, selectedDateIso, onSelect }: DayChipStripProps) {
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
