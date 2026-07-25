'use client';

import { TrashIcon } from '../icons/icons';
import styles from './ui.module.css';

interface EditableMoneyRowProps<TRecurrence extends string = never> {
  name: string;
  amount: number;
  onNameCommit: (value: string) => void;
  onAmountCommit: (value: number) => void;
  onDelete: () => void;
  // Opcionales -- solo Finanzas los usa (periodicidad de ingresos/gastos).
  // Gastos diarios no los pasa, así que no le aparece el select.
  recurrence?: TRecurrence;
  recurrenceOptions?: { value: TRecurrence; label: string }[];
  onRecurrenceCommit?: (value: TRecurrence) => void;
}

// Fila de nombre+monto editable inline, usada por Finanzas (ingresos/gastos)
// y Gastos diarios (gasto del día/fijo) -- mismo patrón en los 4 diseños.
// Los cambios se confirman en onBlur (no en cada tecla) para no disparar un
// PATCH por cada carácter tecleado.
export function EditableMoneyRow<TRecurrence extends string = never>({
  name,
  amount,
  onNameCommit,
  onAmountCommit,
  onDelete,
  recurrence,
  recurrenceOptions,
  onRecurrenceCommit,
}: EditableMoneyRowProps<TRecurrence>) {
  return (
    <div className={styles.editableRow}>
      <input
        className={styles.editableRowName}
        type="text"
        defaultValue={name}
        onBlur={(event) => {
          const value = event.target.value.trim();
          if (value && value !== name) onNameCommit(value);
        }}
      />
      {recurrenceOptions && onRecurrenceCommit && (
        <select
          className={styles.editableRowRecurrence}
          value={recurrence}
          onChange={(event) => onRecurrenceCommit(event.target.value as TRecurrence)}
          aria-label={`Periodicidad de ${name}`}
        >
          {recurrenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <input
        className={styles.editableRowAmount}
        type="number"
        step="0.01"
        defaultValue={amount}
        onBlur={(event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value) && value !== amount) onAmountCommit(value);
        }}
      />
      <button type="button" className={styles.iconInlineButton} onClick={onDelete} aria-label={`Eliminar ${name}`}>
        <TrashIcon width={13} height={13} />
      </button>
    </div>
  );
}
