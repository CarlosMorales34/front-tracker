'use client';

import { useState } from 'react';
import { CaretDownIcon, PlusIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CreditCard, UpdateCreditCardInput } from '../types/finance.types';
import { AddCreditCardModal } from './AddCreditCardModal';
import { CreditCardRow } from './CreditCardRow';
import styles from './finance.module.css';

interface CapitalSectionProps {
  walletBalance: number;
  creditCards: CreditCard[];
  currencySymbol: string;
  onSaveWallet: (balance: number) => Promise<void>;
  onCreateCard: (name: string, creditLimit: number, dueDay: number, amountOwed: number) => Promise<void>;
  onSaveCard: (id: string, changes: UpdateCreditCardInput) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

// Colapsable: Liquidez (cartera, ajustable a mano) + Crédito (tarjetas) --
// ambos montos siempre visibles en el header, colapsado o no.
export function CapitalSection({
  walletBalance,
  creditCards,
  currencySymbol,
  onSaveWallet,
  onCreateCard,
  onSaveCard,
  onDeleteCard,
}: CapitalSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCardModalOpen, setCardModalOpen] = useState(false);

  const totalAvailableCredit = creditCards.reduce((sum, card) => sum + card.available, 0);
  const totalCapital = walletBalance + totalAvailableCredit;

  return (
    <div className={uiStyles.card} data-tour="finanzas-capital">
      <button type="button" className={styles.capitalHeader} onClick={() => setIsCollapsed((prev) => !prev)}>
        <span className={styles.capitalHeaderLeft}>
          <CaretDownIcon className={styles.capitalCollapseIcon} data-collapsed={isCollapsed} />
          <span className={uiStyles.sectionLabel}>Capital</span>
        </span>
        <span className={styles.capitalTotals}>
          <span>
            Presupuesto {currencySymbol}
            {walletBalance.toLocaleString('es-MX')}
          </span>
          <span>
            Crédito {currencySymbol}
            {totalAvailableCredit.toLocaleString('es-MX')}
          </span>
        </span>
      </button>

      <div className={styles.collapseWrapper} data-collapsed={isCollapsed}>
        <div className={styles.collapseInner}>
        <div className={styles.capitalBody}>
          <div className={uiStyles.card}>
            <p className={uiStyles.cardLabel}>Presupuesto (liquidez)</p>
            <p className={uiStyles.bigStat}>
              {currencySymbol}
              {walletBalance.toLocaleString('es-MX')}
            </p>
            <p className={uiStyles.cardNote}>
              Se descuenta solo al registrar un gasto y suma solo al registrar un ingreso. Corrígelo a mano si
              contaste tu dinero real.
            </p>
            <div className={styles.debtRow}>
              <span className={styles.debtRowLabel}>Corregir presupuesto</span>
              <input
                className={styles.debtInput}
                type="number"
                step="0.01"
                placeholder={walletBalance.toString()}
                onBlur={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value) && event.target.value !== '') onSaveWallet(value);
                }}
              />
            </div>
          </div>

          <div>
            <div className={uiStyles.sectionHeader}>
              <span className={uiStyles.sectionLabel}>
                Tarjetas de crédito · libre {currencySymbol}
                {totalAvailableCredit.toLocaleString('es-MX')}
              </span>
              <button
                type="button"
                className={uiStyles.iconOnlyButton}
                onClick={() => setCardModalOpen(true)}
                aria-label="Nueva tarjeta de crédito"
              >
                <PlusIcon />
              </button>
            </div>
            {creditCards.length === 0 ? (
              <p className={uiStyles.cardNote}>Todavía no tienes tarjetas registradas.</p>
            ) : (
              creditCards.map((card) => (
                <CreditCardRow
                  key={card.id}
                  card={card}
                  currencySymbol={currencySymbol}
                  onSave={(changes) => onSaveCard(card.id, changes)}
                  onDelete={() => onDeleteCard(card.id)}
                />
              ))
            )}
          </div>

          <div className={styles.capitalTotalRow}>
            <span>Capital total (liquidez + crédito disponible)</span>
            <span className={styles.capitalTotalValue}>
              {currencySymbol}
              {totalCapital.toLocaleString('es-MX')}
            </span>
          </div>
        </div>
        </div>
      </div>

      {isCardModalOpen && (
        <AddCreditCardModal
          currencySymbol={currencySymbol}
          onClose={() => setCardModalOpen(false)}
          onCreate={async (name, creditLimit, dueDay, amountOwed) => {
            await onCreateCard(name, creditLimit, dueDay, amountOwed);
            setCardModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
