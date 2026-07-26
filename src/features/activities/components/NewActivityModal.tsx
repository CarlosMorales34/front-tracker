'use client';

import { FormEvent, useState } from 'react';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface NewActivityModalProps {
  categoryName: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewActivityModal({ categoryName, onClose, onCreate }: NewActivityModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <Modal title={`Nueva actividad en ${categoryName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm} data-tour="activity-modal-form">
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Journaling"
            autoFocus
            data-tour="activity-name-input"
          />
        </label>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Crear actividad
          </button>
        </div>
      </form>
    </Modal>
  );
}
