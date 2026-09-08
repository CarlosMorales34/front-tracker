'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { sanitizeDecimal } from '../../../shared/lib/numeric-input';
import { BodyMeasurement, MeasurementFields } from '../types/body-progress.types';
import uiStyles from '../../../shared/components/ui/ui.module.css';

interface MeasurementModalProps {
  measurement?: BodyMeasurement;
  onClose: () => void;
  onSave: (input: MeasurementFields) => Promise<void>;
}

function toDatetimeLocal(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Formulario de una medición -- todas las métricas son opcionales
// individualmente (se puede registrar solo cintura, por ejemplo), pero se
// exige al menos una antes de guardar, igual que valida el backend.
export function MeasurementModal({ measurement, onClose, onSave }: MeasurementModalProps) {
  const isEditing = measurement !== undefined;
  const [measuredAt, setMeasuredAt] = useState(() => toDatetimeLocal(measurement?.measuredAt));
  const [weightKg, setWeightKg] = useState(measurement?.weightKg?.toString() ?? '');
  const [bodyFatPercentage, setBodyFatPercentage] = useState(measurement?.bodyFatPercentage?.toString() ?? '');
  const [waistCm, setWaistCm] = useState(measurement?.waistCm?.toString() ?? '');
  const [chestCm, setChestCm] = useState(measurement?.chestCm?.toString() ?? '');
  const [hipsCm, setHipsCm] = useState(measurement?.hipsCm?.toString() ?? '');
  const [notes, setNotes] = useState(measurement?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const parseOrNull = (raw: string): number | null => (raw.trim() === '' ? null : Number(raw));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const fields: MeasurementFields = {
      // A propósito NO usa toISOString() (fuerza UTC) -- mismo criterio
      // local-date-safe que shared/lib/week.ts. `measuredAt` ya es el literal
      // local "YYYY-MM-DDTHH:mm" del input datetime-local; convertirlo a UTC
      // y de regreso dependía de que el timezone del servidor coincidiera
      // con el del usuario, lo que causaba que mediciones tarde en la noche
      // se guardaran con la fecha corrida.
      measuredAt: `${measuredAt}:00`,
      weightKg: parseOrNull(weightKg),
      bodyFatPercentage: parseOrNull(bodyFatPercentage),
      waistCm: parseOrNull(waistCm),
      chestCm: parseOrNull(chestCm),
      hipsCm: parseOrNull(hipsCm),
      notes: notes.trim() || null,
    };
    if (
      fields.weightKg === null &&
      fields.bodyFatPercentage === null &&
      fields.waistCm === null &&
      fields.chestCm === null &&
      fields.hipsCm === null
    ) {
      setError('Registra al menos un dato (peso, % grasa o alguna circunferencia).');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la medición.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar medición' : 'Registrar medición'} onClose={onClose}>
      <form onSubmit={handleSubmit} className={uiStyles.modalForm}>
        <label className={uiStyles.modalLabel}>
          Fecha y hora
          <input
            className={uiStyles.modalInput}
            type="datetime-local"
            value={measuredAt}
            onChange={(event) => setMeasuredAt(event.target.value)}
            required
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Peso (kg)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            placeholder="Ej. 72.4"
            value={weightKg}
            onChange={(event) => setWeightKg(sanitizeDecimal(event.target.value))}
          />
        </label>

        <label className={uiStyles.modalLabel}>
          % de grasa corporal (opcional)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            placeholder="Ej. 18.5"
            value={bodyFatPercentage}
            onChange={(event) => setBodyFatPercentage(sanitizeDecimal(event.target.value))}
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Cintura (cm, opcional)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            value={waistCm}
            onChange={(event) => setWaistCm(sanitizeDecimal(event.target.value))}
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Pecho (cm, opcional)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            value={chestCm}
            onChange={(event) => setChestCm(sanitizeDecimal(event.target.value))}
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Cadera (cm, opcional)
          <input
            className={uiStyles.modalInput}
            type="text"
            inputMode="decimal"
            value={hipsCm}
            onChange={(event) => setHipsCm(sanitizeDecimal(event.target.value))}
          />
        </label>

        <label className={uiStyles.modalLabel}>
          Notas (opcional)
          <textarea
            className={uiStyles.modalInput}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        {error && <p className={uiStyles.cardNote} style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div className={uiStyles.modalActions}>
          <button type="button" className={uiStyles.modalCancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={uiStyles.modalPrimaryButton} disabled={isSaving}>
            {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
