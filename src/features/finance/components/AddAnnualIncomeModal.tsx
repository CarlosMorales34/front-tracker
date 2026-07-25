'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddAnnualIncomeModalProps {
  currencySymbol: string;
  existingYears: number[];
  onClose: () => void;
  onCreate: (year: number, amount: number) => void;
}

export function AddAnnualIncomeModal({ currencySymbol, existingYears, onClose, onCreate }: AddAnnualIncomeModalProps) {
  const currentYear = new Date().getFullYear();
  const defaultYear = existingYears.includes(currentYear) ? currentYear - 1 : currentYear;
  const [year, setYear] = useState(String(defaultYear));
  const [amount, setAmount] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedYear = Number(year);
    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedYear) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    onCreate(parsedYear, parsedAmount);
  };

  return (
    <Modal title="Ingreso anual" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Año
          <input
            className={styles.modalInput}
            type="number"
            step="1"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            autoFocus
          />
        </label>
        <label className={styles.modalLabel}>
          Total del año ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </label>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
