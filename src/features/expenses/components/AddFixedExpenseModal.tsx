'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddFixedExpenseModalProps {
  currencySymbol: string;
  onClose: () => void;
  onCreate: (name: string, amount: number, dayOfMonth: number, description: string | null) => void;
}

// Gasto programado: día del mes en que se cobra (ej. Plan celular, día 10)
// + descripción opcional para completar el concepto cuando el nombre no basta.
export function AddFixedExpenseModal({ currencySymbol, onClose, onCreate }: AddFixedExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    const parsedDay = Number(dayOfMonth);
    if (!name.trim() || !Number.isFinite(parsedAmount) || !Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) return;
    onCreate(name.trim(), parsedAmount, parsedDay, description.trim() || null);
  };

  return (
    <Modal title="Nuevo gasto programado" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Concepto
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Plan celular"
            autoFocus
          />
        </label>
        <label className={styles.modalLabel}>
          Monto ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className={styles.modalLabel}>
          Día del mes
          <input
            className={styles.modalInput}
            type="number"
            min={1}
            max={31}
            step={1}
            value={dayOfMonth}
            onChange={(event) => setDayOfMonth(event.target.value)}
          />
        </label>
        <label className={styles.modalLabel}>
          Descripción (opcional)
          <input
            className={styles.modalInput}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ej. Línea con AT&T, plan de 500 min"
          />
        </label>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  );
}
