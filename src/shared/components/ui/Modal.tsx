'use client';

import { ReactNode, useEffect, useState } from 'react';
import { CloseIcon } from '../icons/icons';
import styles from './ui.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Coincide con --duration-modal en globals.css: retrasa el unmount real para
// que la salida (fade + scale) alcance a reproducirse antes de que React
// quite el componente del DOM.
const CLOSE_ANIMATION_MS = 250;

// Modal genérico reusado por todos los módulos con datos (Actividades,
// Finanzas, Gastos, Peso, Registro semanal) -- antes vivía duplicado dentro
// de features/activities, se movió acá cuando el segundo módulo lo necesitó.
export function Modal({ title, onClose, children }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, CLOSE_ANIMATION_MS);
  };

  return (
    <div className={styles.modalBackdrop} data-visible={isVisible} onClick={handleClose}>
      <div className={styles.modalCard} data-visible={isVisible} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button type="button" className={styles.modalCloseButton} onClick={handleClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
