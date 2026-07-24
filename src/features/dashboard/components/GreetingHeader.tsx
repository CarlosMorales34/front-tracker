import { CalendarIcon, FlameIcon } from '../../../shared/components/icons/icons';
import styles from './dashboard.module.css';

interface GreetingHeaderProps {
  name: string;
  dateRangeLabel: string;
  streakDays: number;
  streakHasData: boolean;
}

export function GreetingHeader({ name, dateRangeLabel, streakDays, streakHasData }: GreetingHeaderProps) {
  return (
    <header className={styles.greetingHeader}>
      <div>
        <h1 className={styles.greetingTitle}>Hola, {name}</h1>
        <p className={styles.greetingDate}>
          <CalendarIcon /> {dateRangeLabel}
        </p>
      </div>
      <div className={styles.streakPill}>
        <FlameIcon /> {streakHasData ? `${streakDays} días de racha` : 'Empieza tu racha'}
      </div>
    </header>
  );
}
