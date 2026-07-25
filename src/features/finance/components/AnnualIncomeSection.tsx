'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, TrendDownIcon, TrendUpIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { FinanceAnnualIncome } from '../types/finance.types';
import { AddAnnualIncomeModal } from './AddAnnualIncomeModal';
import styles from './finance.module.css';

interface AnnualIncomeSectionProps {
  entries: FinanceAnnualIncome[];
  currencySymbol: string;
  onSave: (year: number, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Historial de ingresos totales por año, capturado a mano (ej. migrando la
// tabla de Excel del usuario) -- independiente de los MoneyEntry semanales,
// solo para comparar incremento/decremento año contra año.
export function AnnualIncomeSection({ entries, currencySymbol, onSave, onDelete }: AnnualIncomeSectionProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className={uiStyles.card}>
      <div className={uiStyles.sectionHeader}>
        <span className={uiStyles.sectionLabel}>Ingresos anuales</span>
        <button
          type="button"
          className={uiStyles.iconOnlyButton}
          onClick={() => setModalOpen(true)}
          aria-label="Agregar ingreso anual"
        >
          <PlusIcon />
        </button>
      </div>

      {entries.length === 0 ? (
        <p className={uiStyles.cardNote}>
          Todavía no tienes historial de ingresos anuales. Agrega el total de cada año con el botón +.
        </p>
      ) : (
        <div className={styles.annualIncomeTable}>
          {entries.map((entry) => (
            <div key={entry.year} className={styles.annualIncomeRow}>
              <span className={styles.annualIncomeYear}>
                {entry.year}
                {entry.isLive && <span className={styles.liveBadge}>en vivo</span>}
              </span>
              <span className={styles.annualIncomeAmountWrap}>
                {currencySymbol}
                {entry.isLive ? (
                  <span className={styles.annualIncomeAmountReadOnly}>{entry.amount.toLocaleString('es-MX')}</span>
                ) : (
                  <input
                    className={styles.annualIncomeAmount}
                    type="number"
                    step="0.01"
                    defaultValue={entry.amount}
                    onBlur={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value) && value > 0 && value !== entry.amount) onSave(entry.year, value);
                    }}
                  />
                )}
              </span>
              {entry.growthPercent !== null ? (
                <span className={entry.growthPercent >= 0 ? styles.growthPositive : styles.growthNegative}>
                  {entry.growthPercent >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                  {entry.growthPercent >= 0 ? '+' : ''}
                  {entry.growthPercent.toFixed(2)}%
                </span>
              ) : (
                <span className={styles.growthEmpty}>—</span>
              )}
              {entry.id && (
                <button
                  type="button"
                  className={uiStyles.iconInlineButton}
                  onClick={() => onDelete(entry.id!)}
                  aria-label={`Eliminar ingreso de ${entry.year}`}
                >
                  <TrashIcon width={13} height={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddAnnualIncomeModal
          currencySymbol={currencySymbol}
          existingYears={entries.map((entry) => entry.year)}
          onClose={() => setModalOpen(false)}
          onCreate={async (year, amount) => {
            await onSave(year, amount);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
