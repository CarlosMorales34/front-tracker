'use client';

import { TrashIcon } from '../icons/icons';
import styles from './ui.module.css';

interface EditableMoneyRowProps {
  name: string;
  amount: number;
  onNameCommit: (value: string) => void;
  onAmountCommit: (value: number) => void;
  onDelete: () => void;
}

// Fila de nombre+monto editable inline, usada por Finanzas (ingresos/gastos)
// y Gastos diarios (gasto del día/fijo) -- mismo patrón en los 4 diseños.
// Los cambios se confirman en onBlur (no en cada tecla) para no disparar un
// PATCH por cada carácter tecleado.
export function EditableMoneyRow({ name, amount, onNameCommit, onAmountCommit, onDelete }: EditableMoneyRowProps) {
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
