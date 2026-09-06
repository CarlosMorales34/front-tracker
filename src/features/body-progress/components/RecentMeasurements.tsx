import { PencilIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { BodyMeasurement } from '../types/body-progress.types';
import { formatSignedKg, formatWeightKg } from '../utils/units';
import styles from './body-progress.module.css';

interface RecentMeasurementsProps {
  measurements: BodyMeasurement[];
  onEdit: (measurement: BodyMeasurement) => void;
  onDelete: (measurement: BodyMeasurement) => void;
}

const DAY_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Ordenadas más reciente primero; el delta de cada fila compara contra la
// medición inmediatamente anterior en la lista (no contra "el mes pasado"),
// para reflejar exactamente lo que el usuario ve como "el cambio previo".
export function RecentMeasurements({ measurements, onEdit, onDelete }: RecentMeasurementsProps) {
  const sorted = [...measurements].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

  if (sorted.length === 0) {
    return <p className={styles.emptyState}>Sin mediciones todavía.</p>;
  }

  return (
    <div className={styles.measurementList}>
      {sorted.map((measurement, index) => {
        const previous = sorted[index + 1];
        const delta =
          measurement.weightKg !== null && previous?.weightKg != null ? measurement.weightKg - previous.weightKg : null;
        const date = new Date(measurement.measuredAt);
        return (
          <div key={measurement.id} className={styles.measurementRow}>
            <div className={styles.measurementDateBadge}>
              <span>{DAY_ABBR[date.getMonth()]?.toUpperCase()}</span>
              <strong>{date.getDate()}</strong>
            </div>
            <div className={styles.measurementInfo}>
              <p className={styles.measurementTitle}>Medición</p>
              <p className={uiStyles.cardNote}>{describeMetrics(measurement)}</p>
            </div>
            <div className={styles.measurementValue}>
              <span>{formatWeightKg(measurement.weightKg)} kg</span>
              {delta !== null && (
                <span className={delta <= 0 ? styles.measurementDeltaGood : styles.measurementDeltaBad}>
                  {formatSignedKg(delta)} kg
                </span>
              )}
            </div>
            <div className={styles.measurementActions}>
              <button
                type="button"
                className={uiStyles.iconInlineButton}
                onClick={() => onEdit(measurement)}
                aria-label="Editar medición"
              >
                <PencilIcon width={14} height={14} />
              </button>
              <button
                type="button"
                className={uiStyles.iconInlineButton}
                onClick={() => onDelete(measurement)}
                aria-label="Eliminar medición"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function describeMetrics(measurement: BodyMeasurement): string {
  const parts: string[] = [];
  if (measurement.weightKg !== null) parts.push('Peso');
  if (measurement.bodyFatPercentage !== null) parts.push('% grasa');
  if (measurement.waistCm !== null) parts.push('cintura');
  if (measurement.chestCm !== null) parts.push('pecho');
  if (measurement.hipsCm !== null) parts.push('cadera');
  return parts.join(' y ');
}
