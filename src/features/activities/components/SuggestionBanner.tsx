import { ActivitySuggestion } from '../../activity-suggestions/types/activity-suggestions.types';
import { CloseIcon } from '../../../shared/components/icons/icons';
import styles from './activities.module.css';

interface SuggestionBannerProps {
  suggestion: ActivitySuggestion;
  activityName: string;
  categoryName: string;
  onReview: () => void;
  onDismiss: () => void;
}

// Minimalista a propósito, separado visualmente de las tarjetas de
// categoría/rutina -- solo indicador + nombre + patrón + confianza +
// "Revisar". Nunca aplica la sugerencia desde acá, ni tiene un botón grande
// "Usar" -- para eso está el editor (SuggestionEditor), que abre "Revisar".
export function SuggestionBanner({ suggestion, activityName, categoryName, onReview, onDismiss }: SuggestionBannerProps) {
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div className={styles.suggestionBanner}>
      <div className={styles.suggestionBannerTop}>
        <span className={styles.suggestionBadge}>
          ✦ Sugerencia · {suggestion.sampleCount} registros
        </span>
        <button
          type="button"
          className={styles.iconOnlyButton}
          onClick={onDismiss}
          aria-label="Descartar sugerencia"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
      <div className={styles.suggestionBannerBody}>
        <div>
          <p className={styles.suggestionActivityName}>
            {categoryName} · {activityName}
          </p>
          <p className={styles.cardNote}>{suggestion.reason}</p>
        </div>
        <div className={styles.suggestionBannerActions}>
          <span className={styles.suggestionConfidence}>{confidencePercent}%</span>
          <button type="button" className={styles.suggestionReviewButton} onClick={onReview}>
            Revisar
          </button>
        </div>
      </div>
    </div>
  );
}
