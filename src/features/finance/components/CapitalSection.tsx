'use client';

import { useState } from 'react';
import { PlusIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CreditCard, UpdateCreditCardInput } from '../types/finance.types';
import { AddCreditCardModal } from './AddCreditCardModal';
import { CreditCardRow } from './CreditCardRow';

interface CapitalSectionProps {
  creditCards: CreditCard[];
  currencySymbol: string;
  onCreateCard: (name: string, creditLimit: number, dueDay: number, amountOwed: number) => Promise<void>;
  onSaveCard: (id: string, changes: UpdateCreditCardInput) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

// Solo tarjetas de crédito -- la liquidez (Cartera/Conciliar saldo) y la
// deuda viven directo en PatrimonioView, como sus propias secciones (ver
// mockup de referencia: Liquidez / Tarjetas / Deudas son 3 bloques
// separados, ya no una sola tarjeta "Capital" colapsable con un total que
// sumaba crédito como si fuera propio).
export function CapitalSection({ creditCards, currencySymbol, onCreateCard, onSaveCard, onDeleteCard }: CapitalSectionProps) {
  const [isCardModalOpen, setCardModalOpen] = useState(false);
  const totalAvailableCredit = creditCards.reduce((sum, card) => sum + card.available, 0);

  return (
    <div>
      <div className={uiStyles.sectionHeader} data-tour="finanzas-capital">
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
      <p className={uiStyles.cardNote}>El crédito disponible se muestra por separado y no se suma al patrimonio.</p>

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
