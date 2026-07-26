import styles from './weight.module.css';

interface WorkoutValueChipsProps {
  points: { label: string; value: number | null }[];
  unit: string;
}

// Tira horizontal con scroll, mismo patrón que dayChipStrip/dayChip de
// Actividades -- hace visibles los valores exactos (fecha + número) debajo
// del trazo del SVG, que por sí solo no muestra cifras.
export function WorkoutValueChips({ points, unit }: WorkoutValueChipsProps) {
  return (
    <div className={styles.valueChipStrip}>
      {points.map((point, index) => (
        <div key={index} className={styles.valueChip}>
          <span className={styles.valueChipLabel}>{point.label}</span>
          <span className={styles.valueChipValue}>{point.value === null ? '–' : point.value.toLocaleString('es-MX')}</span>
          <span className={styles.valueChipUnit}>{unit}</span>
        </div>
      ))}
    </div>
  );
}
