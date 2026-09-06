'use client';

import { FormEvent, useState } from 'react';
import { ActivitySuggestion } from '../../activity-suggestions/types/activity-suggestions.types';
import styles from './activities.module.css';
import { Modal } from './Modal';

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

interface SuggestionEditorProps {
  suggestion: ActivitySuggestion;
  activityName: string;
  categoryName: string;
  selectedDateIso: string;
  onClose: () => void;
  onAccept: (finalValues: Record<string, unknown>) => Promise<void>;
}

function toggleDay(days: number[], day: number): number[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b);
}

// El editor de sugerencias: deja revisar y corregir TODA la propuesta antes
// de guardarla -- nunca la aplica directo. Para 'create_routine' además
// permite nombrar la rutina y elegir desde cuándo/hasta cuándo aplica
// (nunca toca fechas pasadas: "desde" arranca hoy por defecto). Para
// 'update_routine' (rutina fija ya existente, ej. Dormir/Trabajo) solo se
// confirman/corrigen los días y el horario detectado -- no tiene nombre que
// editar ni vigencia que elegir, la rutina ya existe y sigue activa igual.
export function SuggestionEditor({
  suggestion,
  activityName,
  categoryName,
  selectedDateIso,
  onClose,
  onAccept,
}: SuggestionEditorProps) {
  const isRoutineCreation = suggestion.suggestionType === 'create_routine';
  const isRoutineUpdate = suggestion.suggestionType === 'update_routine';
  const [routineName, setRoutineName] = useState(activityName);
  const [days, setDays] = useState<number[]>(suggestion.suggestedDays ?? []);
  const [startTime, setStartTime] = useState(suggestion.suggestedStartTime ?? '');
  const [endTime, setEndTime] = useState(suggestion.suggestedEndTime ?? '');
  const [startDate, setStartDate] = useState(suggestion.suggestedStartDate ?? '');
  const [hasEndDate, setHasEndDate] = useState(Boolean(suggestion.suggestedEndDate));
  const [endDate, setEndDate] = useState(suggestion.suggestedEndDate ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const finalValues: Record<string, unknown> = {
        suggestedDays: days,
        suggestedStartTime: startTime,
        suggestedEndTime: endTime,
        logDate: selectedDateIso,
      };
      if (isRoutineCreation) {
        finalValues.routineName = routineName.trim() || activityName;
        finalValues.suggestedStartDate = startDate || null;
        finalValues.suggestedEndDate = hasEndDate ? endDate || null : null;
      }
      await onAccept(finalValues);
    } finally {
      setIsSaving(false);
    }
  };

  const title = isRoutineCreation ? 'Convertir en rutina' : isRoutineUpdate ? 'Actualizar rutina' : 'Revisar sugerencia';

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <p className={styles.cardNote}>{suggestion.reason}</p>

        <label className={styles.modalLabel}>
          {isRoutineUpdate ? 'Rutina' : 'Actividad'}
          <input className={styles.modalInput} value={activityName} disabled />
        </label>
        {!isRoutineUpdate && (
          <label className={styles.modalLabel}>
            Categoría
            <input className={styles.modalInput} value={categoryName} disabled />
          </label>
        )}

        {isRoutineCreation && (
          <label className={styles.modalLabel}>
            Nombre de la rutina
            <input
              className={styles.modalInput}
              value={routineName}
              onChange={(event) => setRoutineName(event.target.value)}
              autoFocus
            />
          </label>
        )}

        <div className={styles.modalLabel}>
          Días
          <div className={styles.suggestionDaysRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <button
                key={label}
                type="button"
                className={styles.suggestionDayChip}
                data-selected={days.includes(index)}
                onClick={() => setDays((prev) => toggleDay(prev, index))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.suggestionTimeRow}>
          <label className={styles.modalLabel}>
            Hora inicial
            <input
              type="time"
              className={styles.modalInput}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>
          <label className={styles.modalLabel}>
            Hora final
            <input
              type="time"
              className={styles.modalInput}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </label>
        </div>

        {isRoutineCreation && (
          <>
            <div className={styles.suggestionTimeRow}>
              <label className={styles.modalLabel}>
                Vigente desde
                <input
                  type="date"
                  className={styles.modalInput}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className={styles.modalLabel}>
                Vigente hasta
                <input
                  type="date"
                  className={styles.modalInput}
                  value={endDate}
                  disabled={!hasEndDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </div>
            <label className={styles.suggestionCheckboxLabel}>
              <input
                type="checkbox"
                checked={!hasEndDate}
                onChange={(event) => setHasEndDate(!event.target.checked)}
              />
              Dejar activa hasta que yo la desactive
            </label>
            <p className={styles.cardNote}>
              No reemplaza ni borra ningún registro que ya hayas capturado -- solo aplica hacia adelante, desde la
              fecha que elijas.
            </p>
          </>
        )}

        <p className={styles.cardNote}>Tus correcciones aquí ayudan a que futuras sugerencias se ajusten mejor.</p>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" className={styles.modalPrimaryButton} disabled={isSaving}>
            {isRoutineCreation ? 'Guardar rutina' : isRoutineUpdate ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
