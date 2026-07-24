export interface CategoryHours {
  label: string;
  hours: number;
}

export interface AnnualBalanceYear {
  year: number;
  amount: number;
}

export interface DashboardData {
  greetingName: string;
  dateRangeLabel: string;
  streakDays: number;
  productivity: {
    percent: number;
    goalHours: number;
    note: string;
  };
  streak: {
    days: number;
    note: string;
  };
  categoryHours: CategoryHours[];
  monthlyBalance: {
    amount: number;
    income: number;
    expenses: number;
  };
  currentWeight: {
    kg: number;
    goalKg: number;
  };
  annualBalance: {
    amount: number;
    growthPercentVsPreviousYear: number;
    byYear: AnnualBalanceYear[];
  };
}
