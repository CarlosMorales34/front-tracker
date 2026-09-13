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
  // Moneda vigente al momento de crearse -- inmutable después. null en filas
  // muy viejas que no pudieron backfillearse.
  currency: string | null;
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
  // true = ese año mezcla monedas distintas entre sus ingresos -- amount no
  // se puede mostrar como una cifra confiable en una sola moneda.
  isMixedCurrency: boolean;
}

export interface FinanceSettings {
  debtTotal: number;
  currency: 'MXN' | 'USD';
  // Ancla para la numeración de semana en Finanzas (ej. "Sem 3") -- no
  // afecta el agrupamiento sábado-a-viernes real de finance_entries. Debe
  // caer en sábado (el backend lo valida).
  week1AnchorDate: string | null;
  // Saldo de cartera (liquidez: efectivo/débito). Se ajusta solo al
  // registrar/editar/borrar ingresos y gastos variables; para corregirlo a
  // mano usar financeApi.reconcileWallet (deja rastro auditable).
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
  // Si viene, se aplica vía reconciliación auditable en vez de sobrescribir
  // directo -- ver ReconcileWalletModal para el mismo patrón en cartera.
  amountOwed?: number;
  reason?: string | null;
}

export interface DebtPayment {
  id: string;
  weekStartDate: string;
  amount: number;
  interestAmount: number;
}

export interface CreateDebtPaymentInput {
  weekStartDate: string;
  amount: number;
  interestAmount?: number;
}

// finance_savings_log -- ya no se escribe desde la UI (Ahorro pasa a ser
// calculado, ver SavingsSummary), se deja el tipo por compatibilidad con el
// endpoint que sigue existiendo.
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
  // Incluye el interés de abonos a deuda de esta semana.
  totalExpense: number;
  interestThisWeek: number;
  balance: number;
  debtTotal: number;
  debtPaid: number;
  debtRemaining: number;
  weekAbono: number;
  savingsAccumulated: number;
  weekSavings: number;
  // 'mixed' si los ingresos de la semana no comparten una sola moneda --
  // en ese caso totalIncome/balance no se deben mostrar como cifra confiable.
  currency: string;
  week1AnchorDate: string | null;
  walletBalance: number;
  // Patrimonio neto = liquidez - deuda restante. NUNCA incluye crédito
  // disponible (eso es capacidad de endeudarte, no capital propio).
  netWorth: number;
}

// null = el usuario todavía no asignó presupuesto ese mes -- distinto de un
// presupuesto real de $0 (nunca se muestra como si fuera $0).
export interface MonthlyBudgetSummary {
  year: number;
  month: number;
  budgetAmount: number | null;
  currency: string | null;
  monthExpenseTotal: number;
  remaining: number | null;
  percentUsed: number | null;
}

export interface SavingsSummary {
  year: number;
  accumulated: number;
  thisMonth: number;
}

export type FinanceAdjustmentTarget = 'wallet' | 'credit_card';

export interface FinanceAdjustment {
  id: string;
  target: FinanceAdjustmentTarget;
  targetId: string | null;
  previousAmount: number;
  newAmount: number;
  difference: number;
  reason: string | null;
  createdAt: string;
}
