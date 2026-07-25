'use client';

import { FormEvent, useState } from 'react';
import { FixedRoutine, RoutineType } from '../types/activities.types';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface EditRoutineModalProps {
  routine: FixedRoutine;
  onClose: () => void;
  onSave: (changes: { name?: string; type?: RoutineType }) => void;
}

// Reusa el mismo layout que NewRoutineModal, pre-cargado con los valores
// actuales -- pensado sobre todo para pasar una rutina de "Hora única" a
// "Rango de horas" (ej. Dormir: hora de acostarse/despertarse) sin perder su
// posición ni tener que recrearla.
export function EditRoutineModal({ routine, onClose, onSave }: EditRoutineModalProps) {
  const [name, setName] = useState(routine.name);
  const [type, setType] = useState<RoutineType>(routine.type);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), type });
  };

  return (
    <Modal title="Editar rutina fija" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
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
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
