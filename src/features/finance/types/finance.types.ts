export type MoneyEntryType = 'income' | 'expense';

export interface MoneyEntry {
  id: string;
  type: MoneyEntryType;
  name: string;
  amount: number;
  weekStartDate: string; // YYYY-MM-DD (sábado de la semana)
}

export interface CreateMoneyEntryInput {
  type: MoneyEntryType;
  name: string;
  amount: number;
  weekStartDate: string;
}

export interface UpdateMoneyEntryInput {
  name?: string;
  amount?: number;
}

export interface FinanceSettings {
  debtTotal: number;
  currency: 'MXN' | 'USD';
}

export interface DebtPayment {
  id: string;
  weekStartDate: string;
  amount: number;
}

export interface SavingsEntry {
  id: string;
  weekStartDate: string;
  amount: number;
}

// Resumen ya agregado que arma el backend para una semana puntual --
// evita que el front tenga que sumar debtPaid/savingsAccumulated a mano.
export interface FinanceWeekSummary {
  weekStartDate: string;
  income: MoneyEntry[];
  expense: MoneyEntry[];
  totalIncome: number;
  totalExpense: number;
  debtTotal: number;
  debtPaid: number;
  debtRemaining: number;
  weekAbono: number;
  savingsAccumulated: number;
  weekSavings: number;
  currency: 'MXN' | 'USD';
}
