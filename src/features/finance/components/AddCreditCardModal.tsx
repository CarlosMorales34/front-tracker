'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddCreditCardModalProps {
  currencySymbol: string;
  onClose: () => void;
  onCreate: (name: string, creditLimit: number, dueDay: number, amountOwed: number) => void;
}

export function AddCreditCardModal({ currencySymbol, onClose, onCreate }: AddCreditCardModalProps) {
  const [name, setName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [amountOwed, setAmountOwed] = useState('0');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedLimit = Number(creditLimit);
    const parsedDay = Number(dueDay);
    const parsedOwed = Number(amountOwed) || 0;
    if (!name.trim() || !Number.isFinite(parsedLimit) || parsedLimit <= 0) return;
    if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) return;
    onCreate(name.trim(), parsedLimit, parsedDay, parsedOwed);
  };

  return (
    <Modal title="Nueva tarjeta de crédito" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. BBVA Oro"
            autoFocus
          />
        </label>
        <label className={styles.modalLabel}>
          Línea de crédito ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={creditLimit}
            onChange={(event) => setCreditLimit(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className={styles.modalLabel}>
          Día límite de pago
          <input
            className={styles.modalInput}
            type="number"
            min={1}
            max={31}
            step={1}
            value={dueDay}
            onChange={(event) => setDueDay(event.target.value)}
          />
        </label>
        <label className={styles.modalLabel}>
          Por pagar actual ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={amountOwed}
            onChange={(event) => setAmountOwed(event.target.value)}
            placeholder="0"
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
