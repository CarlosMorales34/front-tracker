import { MonthlyBudgetSummary } from '../types/finance.types';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import styles from './finance.module.css';

interface MonthlyBudgetCardProps {
  summary: MonthlyBudgetSummary;
  monthLabel: string;
  currencySymbol: string;
  onSave: (amount: number) => void;
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Distinto de "sobrante" (liquidez - gasto del mes, ver Gastos diarios):
// esto es un presupuesto que el usuario asigna a propósito, separado de
// cuánto dinero tiene -- ver GetMonthlyBudgetUseCase en el backend.
export function MonthlyBudgetCard({ summary, monthLabel, currencySymbol, onSave }: MonthlyBudgetCardProps) {
  return (
    <div className={uiStyles.card}>
      <div className={styles.budgetHeader}>
        <p className={uiStyles.cardLabel}>Presupuesto de {monthLabel}</p>
        {summary.percentUsed !== null && <span className={uiStyles.cardNote}>{summary.percentUsed}% utilizado</span>}
      </div>

      {summary.budgetAmount === null ? (
        <>
          <p className={uiStyles.cardNote} style={{ marginBottom: '0.65rem' }}>
            Todavía no asignaste presupuesto para {monthLabel}. Gastado hasta hoy: {currencySymbol}
            {summary.monthExpenseTotal.toLocaleString('es-MX')}.
          </p>
          <div className={styles.debtRow}>
            <span className={styles.debtRowLabel}>Asignar presupuesto</span>
            <input
              className={styles.debtInput}
              type="number"
              step="0.01"
              placeholder="0"
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 0 && event.target.value !== '') onSave(value);
              }}
            />
          </div>
        </>
      ) : (
        <>
          <p className={uiStyles.bigStat}>
            {currencySymbol}
            {(summary.remaining ?? 0).toLocaleString('es-MX')}{' '}
            <span className={styles.budgetCaption}>disponibles de {currencySymbol}{summary.budgetAmount.toLocaleString('es-MX')}</span>
          </p>
          <div className={styles.budgetProgressTrack}>
            <div
              className={styles.budgetProgressFill}
              style={{ width: `${Math.min(100, summary.percentUsed ?? 0)}%` }}
              data-over={summary.percentUsed !== null && summary.percentUsed > 100}
            />
          </div>
          <div className={styles.budgetFooterRow}>
            <span>Gastado {currencySymbol}{summary.monthExpenseTotal.toLocaleString('es-MX')}</span>
            <span>Restante {currencySymbol}{(summary.remaining ?? 0).toLocaleString('es-MX')}</span>
          </div>
          <div className={styles.debtRow}>
            <span className={styles.debtRowLabel}>Corregir presupuesto</span>
            <input
              className={styles.debtInput}
              type="number"
              step="0.01"
              placeholder={summary.budgetAmount.toString()}
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 0 && event.target.value !== '') onSave(value);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function monthLabelFor(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}
