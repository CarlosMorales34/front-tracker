export type MoneyEntryType = 'income' | 'expense';
export type MoneyEntryRecurrence = 'unique' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export const RECURRENCE_LABELS: Record<MoneyEntryRecurrence, string> = {
  unique: 'Único',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

export interface MoneyEntry {
  id: string;
  type: MoneyEntryType;
  name: string;
  amount: number;
  recurrence: MoneyEntryRecurrence;
  weekStartDate: string; // YYYY-MM-DD (sábado de la semana)
}

export interface CreateMoneyEntryInput {
  type: MoneyEntryType;
  name: string;
  amount: number;
  recurrence: MoneyEntryRecurrence;
  weekStartDate: string;
}

export interface UpdateMoneyEntryInput {
  name?: string;
  amount?: number;
  recurrence?: MoneyEntryRecurrence;
}

// Historial de ingresos totales por año -- para años con ingresos semanales
// capturados (finance_entries), el monto es una suma en vivo (isLive=true,
// id=null, no editable/borrable); para años sin datos semanales, es un total
// puesto a mano. Comparación año contra año, ver captura de Excel que sirvió
// de referencia para este diseño.
export interface FinanceAnnualIncome {
  id: string | null;
  year: number;
  amount: number;
  growthPercent: number | null;
  isLive: boolean;
}

export interface FinanceSettings {
  debtTotal: number;
  currency: 'MXN' | 'USD';
  // Ancla para la numeración de semana en Finanzas (ej. "Sem 3") -- no
  // afecta el agrupamiento sábado-a-viernes real de finance_entries.
  week1AnchorDate: string | null;
  // Saldo de cartera (liquidez: efectivo/débito). Corregible a mano; se
  // ajusta solo al registrar/editar/borrar ingresos y gastos variables.
  walletBalance: number;
}

// Tarjeta de crédito -- `available` (libre) viene calculado del backend
// (creditLimit - amountOwed), no se recalcula en el front.
export interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  dueDay: number;
  amountOwed: number;
  available: number;
}

export interface CreateCreditCardInput {
  name: string;
  creditLimit: number;
  dueDay: number;
  amountOwed?: number;
}

export interface UpdateCreditCardInput {
  name?: string;
  creditLimit?: number;
  dueDay?: number;
  amountOwed?: number;
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
  totalIncome: number;
  // Gastos diarios (fijos + variables) -- Finanzas ya no captura gastos.
  totalExpense: number;
  debtTotal: number;
  debtPaid: number;
  debtRemaining: number;
  weekAbono: number;
  savingsAccumulated: number;
  weekSavings: number;
  currency: 'MXN' | 'USD';
  week1AnchorDate: string | null;
  walletBalance: number;
}
