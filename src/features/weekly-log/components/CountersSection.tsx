import { PlusIcon, TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { AnnualCounter } from '../types/weekly-log.types';
import styles from './weekly-log.module.css';

interface CountersSectionProps {
  counters: AnnualCounter[];
  year: number;
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export function CountersSection({ counters, year, onAddClick, onDelete }: CountersSectionProps) {
  return (
    <div>
      <div className={uiStyles.sectionHeader}>
        <span className={uiStyles.sectionLabel}>Contadores anuales</span>
        <button type="button" className={uiStyles.iconOnlyButton} onClick={onAddClick} aria-label="Nuevo contador">
          <PlusIcon />
        </button>
      </div>
      {counters.length === 0 ? (
        <p className={uiStyles.cardNote}>Sin contadores todavía.</p>
      ) : (
        counters.map((counter) => (
          <div key={counter.id} className={styles.counterRow}>
            <span className={styles.counterName}>{counter.name}</span>
            {counter.previousYearValue !== null && (
              <span className={styles.counterPrev}>
                {year - 1}: {counter.previousYearValue}
              </span>
            )}
            <span className={styles.counterTag}>
              {year}: {counter.value}
            </span>
            <button
              type="button"
              className={uiStyles.iconInlineButton}
              onClick={() => onDelete(counter.id)}
              aria-label={`Eliminar ${counter.name}`}
            >
              <TrashIcon width={13} height={13} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
