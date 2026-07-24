export interface CategoryHours {
  categoryId: string;
  name: string;
  color: string;
  hours: number;
}

export interface AnnualBalanceYear {
  year: number;
  amount: number;
}

// Cada sección trae su propio `hasData`: un 0 real (ej. racha en 0 días
// porque hoy no registraste) es distinto de "nunca has usado este módulo" --
// el segundo caso muestra un estado vacío, no un dato falso.
export interface DashboardData {
  streakDays: number;
  streakHasData: boolean;
  productivityPercent: number | null;
  productivityHasData: boolean;
  categoryHours: CategoryHours[];
  monthlyBalance: { amount: number; income: number; expenses: number };
  monthlyBalanceHasData: boolean;
  currentWeightKg: number | null;
  weightGoalKg: number;
  currentWeightHasData: boolean;
  annualBalance: {
    year: number;
    amount: number;
    growthPercentVsPreviousYear: number | null;
    byYear: AnnualBalanceYear[];
  };
  annualBalanceHasData: boolean;
}
