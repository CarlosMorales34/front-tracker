import { formatWeekRangeLabel, getCurrentWeekStartIso } from '../../../shared/lib/week';
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
  const dateRangeLabel = formatWeekRangeLabel(getCurrentWeekStartIso());

  return (
    <div className={styles.page}>
      <GreetingHeader
        name={name}
        dateRangeLabel={dateRangeLabel}
        streakDays={data.streakDays}
        streakHasData={data.streakHasData}
      />

      <div className={styles.topRow}>
        <ProductivityCard percent={data.productivityPercent} hasData={data.productivityHasData} />
        <StreakCard days={data.streakDays} hasData={data.streakHasData} />
      </div>

      <CategoryHoursCard categories={data.categoryHours} />

      <StatsRow
        monthlyBalance={data.monthlyBalance}
        monthlyBalanceHasData={data.monthlyBalanceHasData}
        currentWeightKg={data.currentWeightKg}
        weightGoalKg={data.weightGoalKg}
        currentWeightHasData={data.currentWeightHasData}
      />

      <AnnualBalanceCard annualBalance={data.annualBalance} hasData={data.annualBalanceHasData} />
    </div>
  );
}
