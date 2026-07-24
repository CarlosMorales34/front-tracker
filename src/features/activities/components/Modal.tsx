'use client';

import { ReactNode } from 'react';
import { CloseIcon } from '../../../shared/components/icons/icons';
import styles from './activities.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

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
