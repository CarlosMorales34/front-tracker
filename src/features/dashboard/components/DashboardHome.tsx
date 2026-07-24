import { DashboardData } from '../types/dashboard.types';
import { AnnualBalanceCard } from './AnnualBalanceCard';
import { CategoryHoursCard } from './CategoryHoursCard';
import styles from './dashboard.module.css';
import { GreetingHeader } from './GreetingHeader';
import { ProductivityCard } from './ProductivityCard';
import { StatsRow } from './StatsRow';
import { StreakCard } from './StreakCard';

interface DashboardHomeProps {
  name: string;
  data: DashboardData;
}

export function DashboardHome({ name, data }: DashboardHomeProps) {
  return (
    <div className={styles.page}>
      <GreetingHeader name={name} dateRangeLabel={data.dateRangeLabel} streakDays={data.streakDays} />

      <div className={styles.topRow}>
        <ProductivityCard productivity={data.productivity} />
        <StreakCard streak={data.streak} />
      </div>

      <CategoryHoursCard categories={data.categoryHours} />

      <StatsRow monthlyBalance={data.monthlyBalance} currentWeight={data.currentWeight} />

      <AnnualBalanceCard annualBalance={data.annualBalance} />
    </div>
  );
}
