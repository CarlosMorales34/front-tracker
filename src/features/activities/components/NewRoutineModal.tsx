'use client';

import { FormEvent, useState } from 'react';
import { Activity, Category, RoutineType } from '../types/activities.types';
import { ActivityLinkSelect } from './ActivityLinkSelect';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface NewRoutineModalProps {
  categories: Category[];
  activities: Activity[];
  onClose: () => void;
  onCreate: (name: string, type: RoutineType, linkedActivityId: string | null, isSleep: boolean) => void;
}

export function NewRoutineModal({ categories, activities, onClose, onCreate }: NewRoutineModalProps) {
  const [name, setName] = useState('');
  // Range por default: la mayoría de rutinas reales (Dormir, Trabajo) son
  // rangos de horas, no un instante único.
  const [type, setType] = useState<RoutineType>('range');
  const [linkedActivityId, setLinkedActivityId] = useState<string | null>(null);
  const [isSleep, setIsSleep] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), type, linkedActivityId, isSleep);
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
            onClick={() => {
              setType('single');
              // Un horario "single" no tiene hora de fin -> no hay duración
              // que reflejar en una actividad ni que contar como sueño.
              setLinkedActivityId(null);
              setIsSleep(false);
            }}
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

        {type === 'range' && (
          <>
            <ActivityLinkSelect
              categories={categories}
              activities={activities}
              value={linkedActivityId}
              onChange={setLinkedActivityId}
            />
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={isSleep} onChange={(event) => setIsSleep(event.target.checked)} />
              Es tu rutina de sueño (para el indicador de productividad diaria)
            </label>
          </>
        )}

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
