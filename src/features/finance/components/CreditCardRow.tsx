'use client';

import { TrashIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CreditCard, UpdateCreditCardInput } from '../types/finance.types';
import styles from './finance.module.css';

interface CreditCardRowProps {
  card: CreditCard;
  currencySymbol: string;
  onSave: (changes: UpdateCreditCardInput) => void;
  onDelete: () => void;
}

export function CreditCardRow({ card, currencySymbol, onSave, onDelete }: CreditCardRowProps) {
  return (
    <div className={styles.creditCardRow}>
      <div className={styles.creditCardTopRow}>
        <input
          className={uiStyles.editableRowName}
          type="text"
          defaultValue={card.name}
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (value && value !== card.name) onSave({ name: value });
          }}
        />
        <span className={styles.dayOfMonthWrap}>
          Día
          <input
            className={styles.dayOfMonthInput}
            type="number"
            min={1}
            max={31}
            step={1}
            defaultValue={card.dueDay}
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 1 && value <= 31 && value !== card.dueDay) {
                onSave({ dueDay: value });
              }
            }}
          />
        </span>
        <button type="button" className={uiStyles.iconInlineButton} onClick={onDelete} aria-label={`Eliminar ${card.name}`}>
          <TrashIcon width={13} height={13} />
        </button>
      </div>
      <div className={styles.creditCardBottomRow}>
        <label className={styles.creditCardField}>
          Línea
          <input
            className={uiStyles.editableRowAmount}
            type="number"
            step="0.01"
            defaultValue={card.creditLimit}
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value > 0 && value !== card.creditLimit) onSave({ creditLimit: value });
            }}
          />
        </label>
        <label className={styles.creditCardField}>
          Por pagar
          <input
            className={uiStyles.editableRowAmount}
            type="number"
            step="0.01"
            defaultValue={card.amountOwed}
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 0 && value !== card.amountOwed) onSave({ amountOwed: value });
            }}
          />
        </label>
        <span className={styles.creditCardAvailable}>
          Libre {currencySymbol}
          {card.available.toLocaleString('es-MX')}
        </span>
      </div>
    </div>
  );
}
