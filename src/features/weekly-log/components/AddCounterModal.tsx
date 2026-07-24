'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface AddCounterModalProps {
  onClose: () => void;
  onCreate: (name: string, value: number) => void;
}

export function AddCounterModal({ onClose, onCreate }: AddCounterModalProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), Number(value) || 0);
  };

  return (
    <Modal title="Nuevo contador anual" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Libros leídos"
            autoFocus
          />
        </label>
        <label className={styles.modalLabel}>
          Valor
          <input
            className={styles.modalInput}
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="0"
          />
        </label>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Crear contador
          </button>
        </div>
      </form>
    </Modal>
  );
}
