'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';
import { MoneyEntryRecurrence, RECURRENCE_LABELS } from '../types/finance.types';

interface AddMoneyModalProps {
  title: string;
  currencySymbol: string;
  onClose: () => void;
  onCreate: (name: string, amount: number, recurrence: MoneyEntryRecurrence) => void;
}

const RECURRENCE_OPTIONS = Object.entries(RECURRENCE_LABELS) as [MoneyEntryRecurrence, string][];

export function AddMoneyModal({ title, currencySymbol, onClose, onCreate }: AddMoneyModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [recurrence, setRecurrence] = useState<MoneyEntryRecurrence>('unique');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount)) return;
    onCreate(name.trim(), parsedAmount, recurrence);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm} data-tour="money-modal-form">
        <label className={styles.modalLabel}>
          Concepto
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Sueldo"
            autoFocus
            data-tour="money-name-input"
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
            data-tour="money-amount-input"
          />
        </label>
        <label className={styles.modalLabel}>
          Periodicidad
          <select
            className={styles.modalInput}
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value as MoneyEntryRecurrence)}
          >
            {RECURRENCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
