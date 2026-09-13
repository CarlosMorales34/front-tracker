'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface ReconcileWalletModalProps {
  currentBalance: number;
  currencySymbol: string;
  onClose: () => void;
  onReconcile: (countedBalance: number, reason: string | null) => void;
}

// Reemplaza el "corregir presupuesto" que sobrescribía directo -- calcula
// la diferencia contra el saldo calculado y la deja visible antes de
// confirmar, para que quede claro qué se está registrando (ver
// ReconcileWalletUseCase, deja un FinanceAdjustment auditable).
export function ReconcileWalletModal({ currentBalance, currencySymbol, onClose, onReconcile }: ReconcileWalletModalProps) {
  const [countedBalance, setCountedBalance] = useState(currentBalance.toString());
  const [reason, setReason] = useState('');

  const parsed = Number(countedBalance);
  const difference = Number.isFinite(parsed) ? Math.round((parsed - currentBalance) * 100) / 100 : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(parsed)) return;
    onReconcile(parsed, reason.trim() || null);
  };

  return (
    <Modal title="Conciliar saldo" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <p className={styles.cardNote}>
          Saldo calculado hoy: {currencySymbol}
          {currentBalance.toLocaleString('es-MX')}
        </p>
        <label className={styles.modalLabel}>
          Saldo contado ({currencySymbol})
          <input
            className={styles.modalInput}
            type="number"
            step="0.01"
            value={countedBalance}
            onChange={(event) => setCountedBalance(event.target.value)}
            autoFocus
          />
        </label>
        {difference !== null && difference !== 0 && (
          <p className={styles.cardNote}>
            Diferencia: {difference > 0 ? '+' : ''}
            {currencySymbol}
            {difference.toLocaleString('es-MX')}
          </p>
        )}
        <label className={styles.modalLabel}>
          Motivo (opcional)
          <input
            className={styles.modalInput}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Conté mi efectivo"
          />
        </label>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Conciliar
          </button>
        </div>
      </form>
    </Modal>
  );
}
