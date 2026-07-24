'use client';

import { FormEvent, useState } from 'react';
import { RoutineType } from '../types/activities.types';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface NewRoutineModalProps {
  onClose: () => void;
  onCreate: (name: string, type: RoutineType) => void;
}

export function NewRoutineModal({ onClose, onCreate }: NewRoutineModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RoutineType>('single');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), type);
  };

  return (
    <Modal title="Nueva rutina fija" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Siesta"
            autoFocus
          />
        </label>

        <span className={styles.modalLabel}>Tipo</span>
        <div className={styles.segmentedGroup}>
          <button
            type="button"
            className={styles.segmentedOption}
            data-selected={type === 'single'}
            onClick={() => setType('single')}
          >
            Hora única
          </button>
          <button
            type="button"
            className={styles.segmentedOption}
            data-selected={type === 'range'}
            onClick={() => setType('range')}
          >
            Rango de horas
          </button>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Crear rutina
          </button>
        </div>
      </form>
    </Modal>
  );
}
