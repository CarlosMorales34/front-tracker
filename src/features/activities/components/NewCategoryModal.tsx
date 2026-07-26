'use client';

import { FormEvent, useState } from 'react';
import { CATEGORY_COLOR_SWATCHES } from '../constants/category-colors';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface NewCategoryModalProps {
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export function NewCategoryModal({ onClose, onCreate }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLOR_SWATCHES[0]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), color);
  };

  return (
    <Modal title="Nueva categoría" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm} data-tour="category-modal-form">
        <label className={styles.modalLabel}>
          Nombre
          <input
            className={styles.modalInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Salud mental"
            autoFocus
            data-tour="category-name-input"
          />
        </label>

        <span className={styles.modalLabel}>Color</span>
        <div className={styles.swatchRow}>
          {CATEGORY_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={styles.swatch}
              style={{ background: swatch }}
              data-selected={swatch === color}
              onClick={() => setColor(swatch)}
              aria-label={`Color ${swatch}`}
            />
          ))}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton}>
            Crear categoría
          </button>
        </div>
      </form>
    </Modal>
  );
}
