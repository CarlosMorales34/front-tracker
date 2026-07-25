'use client';

import { TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { FixedMonthlyExpense, UpdateFixedExpenseInput } from '../types/expenses.types';
import styles from './expenses.module.css';

interface FixedExpenseRowProps {
  expense: FixedMonthlyExpense;
  onSave: (changes: UpdateFixedExpenseInput) => void;
  onDelete: () => void;
}

// Fila con día del mes + descripción opcional -- reemplaza EditableMoneyRow
// acá porque un gasto programado necesita más campos que nombre+monto.
export function FixedExpenseRow({ expense, onSave, onDelete }: FixedExpenseRowProps) {
  return (
    <div className={styles.fixedExpenseRow}>
      <div className={styles.fixedExpenseTopRow}>
        <input
          className={uiStyles.editableRowName}
          type="text"
          defaultValue={expense.name}
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (value && value !== expense.name) onSave({ name: value });
          }}
        />
        <span className={styles.dayOfMonthWrap}>
          Día
          <input
            className={styles.dayOfMonthInput}
            type="number"
            min={1}
            max={31}
            step={1}
            defaultValue={expense.dayOfMonth ?? ''}
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 1 && value <= 31 && value !== expense.dayOfMonth) {
                onSave({ dayOfMonth: value });
              }
            }}
          />
        </span>
        <input
          className={uiStyles.editableRowAmount}
          type="number"
          step="0.01"
          defaultValue={expense.amount}
          onBlur={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && value !== expense.amount) onSave({ amount: value });
          }}
        />
        <button type="button" className={uiStyles.iconInlineButton} onClick={onDelete} aria-label={`Eliminar ${expense.name}`}>
          <TrashIcon width={13} height={13} />
        </button>
      </div>
      <input
        className={styles.descriptionInput}
        type="text"
        defaultValue={expense.description ?? ''}
        placeholder="Descripción (opcional)"
        onBlur={(event) => {
          const value = event.target.value.trim();
          if (value !== (expense.description ?? '')) onSave({ description: value || null });
        }}
      />
    </div>
  );
}
