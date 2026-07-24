'use client';

import { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WeekDetail } from '../types/weekly-log.types';
import styles from './weekly-log.module.css';

interface WeekDetailModalProps {
  detail: WeekDetail;
  onClose: () => void;
  onSaveNotes: (notes: string) => void;
}

export function WeekDetailModal({ detail, onClose, onSaveNotes }: WeekDetailModalProps) {
  const [notes, setNotes] = useState(detail.notes);

  const deltaLabel =
    detail.deltaVsPreviousWeek === null
      ? 'Primera semana registrada'
      : `${detail.deltaVsPreviousWeek >= 0 ? '+' : ''}${Math.round(detail.deltaVsPreviousWeek)} pts vs. semana anterior`;

  return (
    <Modal title={`Semana ${detail.weekNumber} · ${detail.rangeLabel}`} onClose={onClose}>
      <div className={styles.detailStatRow}>
        <span className={styles.detailBigStat}>{Math.round(detail.percent ?? 0)}%</span>
        <span className={styles.detailMeta}>{deltaLabel}</span>
      </div>

      <p className={uiStyles.cardLabel} style={{ marginTop: '0.9rem' }}>
        Horas por categoría
      </p>
      {detail.categoryHours.length === 0 ? (
        <p className={uiStyles.cardNote}>Sin datos.</p>
      ) : (
        detail.categoryHours.map((cat) => (
          <div key={cat.categoryId} className={styles.detailCatRow}>
            <span className={styles.detailCatDot} style={{ background: cat.color }} />
            <span style={{ flex: 1 }}>{cat.name}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{cat.hours}h</span>
          </div>
        ))
      )}

      <p className={uiStyles.cardLabel} style={{ marginTop: '0.9rem' }}>
        Actividades top
      </p>
      {detail.topActivities.length === 0 ? (
        <p className={uiStyles.cardNote}>Sin datos.</p>
      ) : (
        detail.topActivities.map((activity) => (
          <div key={activity.name} className={styles.detailActivityRow}>
            <span style={{ flex: 1 }}>{activity.name}</span>
            <span style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{activity.hours}h</span>
          </div>
        ))
      )}

      <label className={uiStyles.modalLabel} style={{ marginTop: '0.9rem' }}>
        Notas / reflexión
        <textarea
          className={uiStyles.modalInput}
          rows={3}
          placeholder="¿Qué funcionó esta semana? ¿Qué ajustar?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      <div className={uiStyles.modalActions}>
        <button
          type="button"
          className={uiStyles.modalPrimaryButton}
          onClick={() => {
            if (notes !== detail.notes) onSaveNotes(notes);
            else onClose();
          }}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
