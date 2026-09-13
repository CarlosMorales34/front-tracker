'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddDebtPaymentModalProps {
  currencySymbol: string;
  onClose: () => void;
  onCreate: (amount: number, interestAmount: number) => void;
}

// El interés no baja deuda -- solo el capital (amount - interestAmount) lo
// hace, y el interés se suma como gasto de esa semana (ver
// CreateDebtPaymentUseCase). Por default 0: mismo comportamiento de antes
// si el usuario no distingue interés.
export function AddDebtPaymentModal({ currencySymbol, onClose, onCreate }: AddDebtPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('0');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    const parsedInterest = Number(interestAmount) || 0;
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    if (parsedInterest < 0 || parsedInterest > parsedAmount) return;
    onCreate(parsedAmount, parsedInterest);
  };

  return (
    <Modal title="Registrar abono" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Abono total ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            autoFocus
          />
        </label>
        <label className={styles.modalLabel}>
          De eso, interés ({currencySymbol}, opcional)
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={interestAmount}
            onChange={(event) => setInterestAmount(event.target.value)}
            placeholder="0"
          />
        </label>
        <p className={styles.cardNote}>El interés no baja tu deuda, solo el capital -- se cuenta como gasto de esta semana.</p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}
