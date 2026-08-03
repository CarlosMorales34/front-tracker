'use client';

import { useEffect, useState } from 'react';
import styles from './activities.module.css';

interface DailyFeedbackSectionProps {
  note: string;
  onSave: (note: string) => Promise<void>;
}

// Reflexión libre del día, guardada al perder foco (mismo criterio que
// Notas/reflexión de Registro semanal, pero por día en vez de por semana).
export function DailyFeedbackSection({ note, onSave }: DailyFeedbackSectionProps) {
  const [draft, setDraft] = useState(note);

  // El día seleccionado puede cambiar (DayChipStrip) sin que este componente
  // se remonte -- hay que resincronizar el draft cuando cambia `note` de
  // afuera para no arrastrar el texto del día anterior.
  useEffect(() => {
    setDraft(note);
  }, [note]);

  const handleBlur = () => {
    if (draft !== note) void onSave(draft);
  };

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Feedback del día</span>
      </div>
      <textarea
        className={styles.feedbackTextarea}
        rows={3}
        placeholder="¿Cómo te fue hoy? ¿Qué funcionó, qué ajustar?"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleBlur}
      />
    </section>
  );
}
