import styles from './activities.module.css';

export type ActivitiesTab = 'hoy' | 'semana';

interface HoySemanaToggleProps {
  value: ActivitiesTab;
  onChange: (tab: ActivitiesTab) => void;
}

export function HoySemanaToggle({ value, onChange }: HoySemanaToggleProps) {
  return (
    <div className={styles.hoySemanaToggle}>
      <button type="button" data-selected={value === 'hoy'} onClick={() => onChange('hoy')}>
        Hoy
      </button>
      <button type="button" data-selected={value === 'semana'} onClick={() => onChange('semana')}>
        Semana
      </button>
    </div>
  );
}
