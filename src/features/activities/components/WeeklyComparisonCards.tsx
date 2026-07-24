import { TrendUpIcon } from '../../../shared/components/icons/icons';
import styles from './activities.module.css';

interface ComparisonStat {
  label: string;
  hours: number;
  previousLabel: string;
  previousHours: number;
  diffHours: number;
}

interface WeeklyComparisonCardsProps {
  week: ComparisonStat;
  month: ComparisonStat;
}

export function WeeklyComparisonCards({ week, month }: WeeklyComparisonCardsProps) {
  return (
    <div className={styles.comparisonRow}>
      <ComparisonCard stat={week} />
      <ComparisonCard stat={month} />
    </div>
  );
}

function ComparisonCard({ stat }: { stat: ComparisonStat }) {
  return (
    <div className={styles.card}>
      <p className={styles.sectionLabelInline}>{stat.label}</p>
      <p className={styles.bigStat}>{stat.hours}h</p>
      <p className={styles.cardNote}>
        {stat.previousLabel}: {stat.previousHours} h ·{' '}
        <span className={styles.diffPositive}>
          <TrendUpIcon /> +{stat.diffHours}h vs. {stat.previousLabel.toLowerCase()}
        </span>
      </p>
    </div>
  );
}
