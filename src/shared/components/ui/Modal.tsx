'use client';

import { ReactNode } from 'react';
import { CloseIcon } from '../icons/icons';
import styles from './ui.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Modal genérico reusado por todos los módulos con datos (Actividades,
// Finanzas, Gastos, Peso, Registro semanal) -- antes vivía duplicado dentro
// de features/activities, se movió acá cuando el segundo módulo lo necesitó.
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
