import styles from './activities.module.css';
import { ActivitiesTab, HoySemanaToggle } from './HoySemanaToggle';

interface ActivitiesHeaderProps {
  dateRangeLabel: string;
  tab: ActivitiesTab;
  onTabChange: (tab: ActivitiesTab) => void;
}

export function ActivitiesHeader({ dateRangeLabel, tab, onTabChange }: ActivitiesHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>Actividades diarias</h1>
        <p className={styles.pageSubtitle}>{dateRangeLabel}</p>
      </div>
      <div data-tour="activities-toggle">
        <HoySemanaToggle value={tab} onChange={onTabChange} />
      </div>
    </div>
  );
}
