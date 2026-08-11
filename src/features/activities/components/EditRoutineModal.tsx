'use client';

import { FormEvent, useState } from 'react';
import { Activity, Category, FixedRoutine, RoutineType } from '../types/activities.types';
import { ActivityLinkSelect } from './ActivityLinkSelect';
import styles from './activities.module.css';
import { Modal } from './Modal';

interface EditRoutineModalProps {
  routine: FixedRoutine;
  categories: Category[];
  activities: Activity[];
  onClose: () => void;
  onSave: (changes: { name?: string; type?: RoutineType; linkedActivityId?: string | null; isSleep?: boolean }) => void;
}

// Reusa el mismo layout que NewRoutineModal, pre-cargado con los valores
// actuales -- pensado sobre todo para pasar una rutina de "Hora única" a
// "Rango de horas" (ej. Dormir: hora de acostarse/despertarse) sin perder su
// posición ni tener que recrearla.
export function EditRoutineModal({ routine, categories, activities, onClose, onSave }: EditRoutineModalProps) {
  const [name, setName] = useState(routine.name);
  const [type, setType] = useState<RoutineType>(routine.type);
  const [linkedActivityId, setLinkedActivityId] = useState<string | null>(routine.linkedActivityId);
  const [isSleep, setIsSleep] = useState(routine.isSleep);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, linkedActivityId, isSleep });
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
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
