export interface DailyExpense {
  id: string;
  name: string;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
}

export interface CreateDailyExpenseInput {
  name: string;
  amount: number;
  expenseDate: string;
}

export interface FixedMonthlyExpense {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number | null;
  description: string | null;
}

export interface CreateFixedMonthlyExpenseInput {
  name: string;
  amount: number;
  dayOfMonth: number;
  description?: string | null;
}

export interface UpdateExpenseAmountInput {
  name?: string;
  amount?: number;
}

export interface UpdateFixedExpenseInput {
  name?: string;
  amount?: number;
  dayOfMonth?: number | null;
  description?: string | null;
}

// Resumen agregado (mes actual) que arma el backend -- ingresos del mes
// viene de finance_entries (Finanzas), no se duplica el dato acá.
export interface ExpensesSummary {
  monthIncome: number;
  monthDailyTotal: number;
  fixedTotal: number;
  monthExpenseTotal: number;
  sobrante: number;
  weekTotal: number;
  currency: 'MXN' | 'USD';
}
