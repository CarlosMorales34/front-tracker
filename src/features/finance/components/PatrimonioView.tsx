'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { getCurrentWeekStartIso } from '../../../shared/lib/week';
import { creditCardsApi } from '../services/credit-cards.api';
import { financeApi } from '../services/finance.api';
import { CreditCard, FinanceWeekSummary, UpdateCreditCardInput } from '../types/finance.types';
import { AddDebtPaymentModal } from './AddDebtPaymentModal';
import { CapitalSection } from './CapitalSection';
import { FinanceTabs } from './FinanceTabs';
import { NetWorthCard } from './NetWorthCard';
import { ReconcileWalletModal } from './ReconcileWalletModal';
import styles from './finance.module.css';

export function PatrimonioView() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [summary, setSummary] = useState<FinanceWeekSummary | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isReconcileOpen, setReconcileOpen] = useState(false);
  const [isDebtPaymentOpen, setDebtPaymentOpen] = useState(false);

  const load = useCallback(async () => {
    const [current, cards] = await Promise.all([
      financeApi.getWeekSummary(getCurrentWeekStartIso(), accessToken),
      creditCardsApi.list(accessToken),
    ]);
    setSummary(current);
    setCreditCards(cards);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleReconcile = async (countedBalance: number, reason: string | null) => {
    await financeApi.reconcileWallet(countedBalance, reason, accessToken);
    setReconcileOpen(false);
    load();
  };

  const handleAddDebtPayment = async (amount: number, interestAmount: number) => {
    await financeApi.addDebtPayment({ weekStartDate: getCurrentWeekStartIso(), amount, interestAmount }, accessToken);
    setDebtPaymentOpen(false);
    load();
  };

  const handleCreateCreditCard = async (name: string, creditLimit: number, dueDay: number, amountOwed: number) => {
    await creditCardsApi.create(name, creditLimit, dueDay, amountOwed, accessToken);
    load();
  };

  const handleSaveCreditCard = async (id: string, changes: UpdateCreditCardInput) => {
    await creditCardsApi.update(id, changes, accessToken);
    load();
  };

  const handleDeleteCreditCard = async (id: string) => {
    const card = creditCards.find((c) => c.id === id);
    const ok = await confirm(`Estás a punto de borrar la tarjeta "${card?.name ?? ''}". ¿Estás seguro?`);
    if (!ok) return;
    await creditCardsApi.delete(id, accessToken);
    load();
  };

  if (!summary) {
    return (
      <div className={uiStyles.page}>
        <FinanceTabs />
        <Spinner />
      </div>
    );
  }

  const currencySymbol = summary.currency === 'mixed' ? '$' : summary.currency === 'USD' ? 'US$' : '$';

  return (
    <div className={uiStyles.page}>
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Finanzas</h1>
          <p className={uiStyles.pageSubtitle}>Flujo, presupuesto y posición</p>
        </div>
      </div>

      <FinanceTabs />

      <NetWorthCard netWorth={summary.netWorth} currencySymbol={currencySymbol} />

      <div>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>Liquidez</span>
          <button type="button" className={styles.linkButton} onClick={() => setReconcileOpen(true)}>
            Conciliar saldo
          </button>
        </div>
        <div className={uiStyles.card}>
          <div className={styles.assetRow}>
            <div>
              <p className={styles.assetName}>Cartera</p>
              <p className={uiStyles.cardNote}>Saldo calculado hoy</p>
            </div>
            <span className={styles.assetAmount}>
              {currencySymbol}
              {summary.walletBalance.toLocaleString('es-MX')}
            </span>
          </div>
        </div>
      </div>

      <CapitalSection
        creditCards={creditCards}
        currencySymbol={currencySymbol}
        onCreateCard={handleCreateCreditCard}
        onSaveCard={handleSaveCreditCard}
        onDeleteCard={handleDeleteCreditCard}
      />

      <div>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>Deudas</span>
          <button type="button" className={styles.linkButton} onClick={() => setDebtPaymentOpen(true)}>
            Registrar abono
          </button>
        </div>
        <div className={uiStyles.card}>
          <div className={styles.assetRow}>
            <div>
              <p className={styles.assetName}>Deuda restante</p>
              {summary.weekAbono > 0 && (
                <p className={uiStyles.cardNote}>
                  Abono de esta semana: {currencySymbol}
                  {summary.weekAbono.toLocaleString('es-MX')}
                </p>
              )}
            </div>
            <span className={styles.assetAmount}>
              {currencySymbol}
              {summary.debtRemaining.toLocaleString('es-MX')}
            </span>
          </div>
        </div>
        <p className={uiStyles.cardNote}>Registrar un abono disminuye simultáneamente la deuda y la liquidez.</p>
      </div>

      {isReconcileOpen && (
        <ReconcileWalletModal
          currentBalance={summary.walletBalance}
          currencySymbol={currencySymbol}
          onClose={() => setReconcileOpen(false)}
          onReconcile={handleReconcile}
        />
      )}
      {isDebtPaymentOpen && (
        <AddDebtPaymentModal
          currencySymbol={currencySymbol}
          onClose={() => setDebtPaymentOpen(false)}
          onCreate={handleAddDebtPayment}
        />
      )}
    </div>
  );
}
