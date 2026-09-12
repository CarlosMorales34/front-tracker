import styles from './training.module.css';

interface RestDaysSettingsProps {
  restWeekdays: number[];
  onToggle: (weekday: number) => void;
  isSaving: boolean;
}

const WEEKDAY_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Días de la semana que el usuario marca como descanso a propósito -- no
// rompen la racha de entrenamiento aunque no haya sesión ese día (ver
// GetTrainingStreakUseCase en el backend). Cualquier otro día sin entrenar
// sí la corta, igual que antes.
export function RestDaysSettings({ restWeekdays, onToggle, isSaving }: RestDaysSettingsProps) {
  return (
    <div className={styles.restDaysSettings}>
      <p className={styles.restDaysLabel}>Días de descanso</p>
      <p className={styles.restDaysNote}>No rompen tu racha aunque no entrenes ese día.</p>
      <div className={styles.dayChipStrip}>
        {WEEKDAY_SHORT.map((label, weekday) => (
          <button
            key={weekday}
            type="button"
            className={styles.dayChip}
            data-selected={restWeekdays.includes(weekday)}
            disabled={isSaving}
            onClick={() => onToggle(weekday)}
            aria-pressed={restWeekdays.includes(weekday)}
          >
            <span className={styles.dayChipWeekday}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
