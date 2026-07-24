'use client';

import { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import styles from '../../../shared/components/ui/ui.module.css';

interface WeightNoteModalProps {
  monthLabel: string;
  initialNote: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

export function WeightNoteModal({ monthLabel, initialNote, onClose, onSave }: WeightNoteModalProps) {
  const [note, setNote] = useState(initialNote);

  return (
    <Modal title={`Nota · ${monthLabel}`} onClose={onClose}>
      <div className={styles.modalForm}>
        <label className={styles.modalLabel}>
          Contexto (ej. lesión, vacaciones)
          <textarea
            className={styles.modalInput}
            rows={4}
            placeholder="¿Algo que explique este mes?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            autoFocus
          />
        </label>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={styles.modalPrimaryButton} onClick={() => onSave(note)}>
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
