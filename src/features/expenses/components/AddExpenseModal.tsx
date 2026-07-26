'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddExpenseModalProps {
  title: string;
  currencySymbol: string;
  onClose: () => void;
  onCreate: (name: string, amount: number) => void;
}

export function AddExpenseModal({ title, currencySymbol, onClose, onCreate }: AddExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount)) return;
    onCreate(name.trim(), parsedAmount);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm} data-tour="expense-modal-form">
        <label className={styles.modalLabel}>
          Concepto
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Café"
            autoFocus
            data-tour="expense-name-input"
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
            data-tour="expense-amount-input"
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
