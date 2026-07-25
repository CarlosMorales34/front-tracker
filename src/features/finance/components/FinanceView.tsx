'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretDownIcon, CaretLeftIcon, PlusIcon, WarningIcon } from '../../../shared/components/icons/icons';
import { EditableMoneyRow } from '../../../shared/components/ui/EditableMoneyRow';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { addWeeks, formatWeekRangeLabel, getCurrentWeekStartIso, getWeekNumberForYear } from '../../../shared/lib/week';
import { creditCardsApi } from '../services/credit-cards.api';
import { financeApi } from '../services/finance.api';
import {
  CreditCard,
  FinanceAnnualIncome,
  FinanceWeekSummary,
  MoneyEntryRecurrence,
  RECURRENCE_LABELS,
  UpdateCreditCardInput,
} from '../types/finance.types';
import { getWeekNumberFromAnchor } from '../utils/week';
import { AddMoneyModal } from './AddMoneyModal';
import { AnnualIncomeSection } from './AnnualIncomeSection';
import { CapitalSection } from './CapitalSection';
import styles from './finance.module.css';

const RECURRENCE_SELECT_OPTIONS = Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
  value: value as MoneyEntryRecurrence,
  label,
}));

export function FinanceView() {
  const { accessToken } = useAuth();
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStartIso());
  const [summary, setSummary] = useState<FinanceWeekSummary | null>(null);
  const [lastYearBalance, setLastYearBalance] = useState<number | null>(null);
  const [annualIncome, setAnnualIncome] = useState<FinanceAnnualIncome[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const load = useCallback(async () => {
    const [current, lastYear, annualIncomeRes, creditCardsRes] = await Promise.all([
      financeApi.getWeekSummary(weekStartDate, accessToken),
      financeApi.getWeekSummary(addWeeks(weekStartDate, -52), accessToken),
      financeApi.getAnnualIncome(accessToken),
      creditCardsApi.list(accessToken),
    ]);
    setSummary(current);
    setLastYearBalance(lastYear.totalIncome - lastYear.totalExpense);
    setAnnualIncome(annualIncomeRes);
    setCreditCards(creditCardsRes);
  }, [weekStartDate, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleCreate = async (name: string, amount: number, recurrence: MoneyEntryRecurrence) => {
    await financeApi.createEntry('income', name, amount, recurrence, weekStartDate, accessToken);
    setAddModalOpen(false);
    load();
  };

  const handleSaveAnnualIncome = async (year: number, amount: number) => {
    await financeApi.putAnnualIncome(year, amount, accessToken);
    load();
  };

  const handleDeleteAnnualIncome = async (id: string) => {
    await financeApi.deleteAnnualIncome(id, accessToken);
    load();
  };

  const handleCurrencyChange = async (currency: 'MXN' | 'USD') => {
    await financeApi.updateSettings({ currency }, accessToken);
    load();
  };

  const handleWeek1AnchorCommit = async (rawValue: string) => {
    await financeApi.updateSettings({ week1AnchorDate: rawValue || null }, accessToken);
    load();
  };

  const handleAbonoCommit = async (rawValue: string) => {
    const amount = Number(rawValue);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await financeApi.addDebtPayment(weekStartDate, amount, accessToken);
    load();
  };

  const handleSaveWallet = async (balance: number) => {
    await financeApi.setWallet(balance, accessToken);
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
    await creditCardsApi.delete(id, accessToken);
    load();
  };

  // Solo el primer load (summary null) muestra "Cargando…" reemplazando el
  // árbol -- los refresh posteriores (tras crear/editar algo) mantienen todo
  // montado para no perder estado local no controlado por props, como el
  // colapso de CapitalSection.
  if (!summary) {
    return (
      <div className={uiStyles.page}>
        <p className={uiStyles.cardNote}>Cargando…</p>
      </div>
    );
  }

  const currencySymbol = summary.currency === 'USD' ? 'US$' : '$';
  const balance = summary.totalIncome - summary.totalExpense;
  // new Date(`${iso}T00:00:00`) en vez de new Date(iso): un string de solo
  // fecha se parsea como UTC medianoche, que en un timezone negativo (ej.
  // México) retrocede al día de calendario anterior -- afecta getFullYear()
  // cerca de fin de año.
  const weekStartDateLocal = new Date(`${weekStartDate}T00:00:00`);
  const weekNumber = summary.week1AnchorDate
    ? getWeekNumberFromAnchor(weekStartDate, summary.week1AnchorDate)
    : getWeekNumberForYear(weekStartDate, weekStartDateLocal.getFullYear());
  const currentYear = weekStartDateLocal.getFullYear();
  const vsLastYear = balance - (lastYearBalance ?? 0);

  return (
    <div className={uiStyles.page}>
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Finanzas</h1>
          <p className={uiStyles.pageSubtitle}>Semanal · sáb a vie</p>
        </div>
        <div className={uiStyles.selectWrap}>
          <select
            className={uiStyles.select}
            value={summary.currency}
            onChange={(event) => handleCurrencyChange(event.target.value as 'MXN' | 'USD')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
          <CaretDownIcon className={uiStyles.selectCaret} />
        </div>
      </div>

      <CapitalSection
        walletBalance={summary.walletBalance}
        creditCards={creditCards}
        currencySymbol={currencySymbol}
        onSaveWallet={handleSaveWallet}
        onCreateCard={handleCreateCreditCard}
        onSaveCard={handleSaveCreditCard}
        onDeleteCard={handleDeleteCreditCard}
      />

      <div className={styles.week1AnchorRow}>
        <span className={styles.week1AnchorLabel}>Semana 1 empieza</span>
        <input
          type="date"
          className={styles.week1AnchorInput}
          defaultValue={summary.week1AnchorDate ?? ''}
          onBlur={(event) => handleWeek1AnchorCommit(event.target.value)}
        />
      </div>

      <div className={uiStyles.periodNav}>
        <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setWeekStartDate((d) => addWeeks(d, -1))} aria-label="Semana anterior">
          <CaretLeftIcon />
        </button>
        <span className={uiStyles.periodNavLabel}>
          Sem {weekNumber} · {formatWeekRangeLabel(weekStartDate)}
        </span>
        <button
          type="button"
          className={uiStyles.iconOnlyButton}
          onClick={() => setWeekStartDate((d) => addWeeks(d, 1))}
          aria-label="Semana siguiente"
          style={{ transform: 'scaleX(-1)' }}
        >
          <CaretLeftIcon />
        </button>
      </div>

      {balance < 0 && (
        <div className={uiStyles.alertBanner}>
          <WarningIcon />
          <span>
            Gastaste más de lo que ingresó esta semana. Balance negativo de {currencySymbol}
            {Math.abs(balance).toLocaleString('es-MX')}.
          </span>
        </div>
      )}

      <div className={styles.twoCol}>
        <div className={styles.colStack}>
          <div className={uiStyles.card}>
            <p className={uiStyles.cardLabel}>Balance de la semana</p>
            <p className={uiStyles.bigStat} style={{ color: balance >= 0 ? 'var(--color-accent)' : 'var(--color-text)' }}>
              {currencySymbol}
              {balance.toLocaleString('es-MX')}
            </p>
            <p className={uiStyles.cardNote}>
              Ingresos {currencySymbol}
              {summary.totalIncome.toLocaleString('es-MX')} · Gastos (Gastos diarios) {currencySymbol}
              {summary.totalExpense.toLocaleString('es-MX')}
            </p>
          </div>

          <div className={uiStyles.metricGrid2}>
            <div className={uiStyles.card}>
              <p className={uiStyles.cardLabel}>vs. mismo periodo {currentYear - 1}</p>
              <p className={uiStyles.midStat}>
                {currencySymbol}
                {(lastYearBalance ?? 0).toLocaleString('es-MX')}
              </p>
              <p className={uiStyles.cardNote} style={{ color: vsLastYear >= 0 ? 'var(--color-accent)' : undefined }}>
                {vsLastYear >= 0 ? '+' : ''}
                {vsLastYear.toLocaleString('es-MX')} vs. {currentYear - 1}
              </p>
            </div>
            <div className={uiStyles.card}>
              <p className={uiStyles.cardLabel}>Ahorrado en {currentYear}</p>
              <p className={uiStyles.midStat}>
                {currencySymbol}
                {summary.savingsAccumulated.toLocaleString('es-MX')}
              </p>
              <p className={uiStyles.cardNote}>
                +{currencySymbol}
                {summary.weekSavings.toLocaleString('es-MX')} esta semana
              </p>
            </div>
          </div>

          <div className={uiStyles.card}>
            <p className={uiStyles.cardLabel}>Deuda</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className={uiStyles.midStat} style={{ fontSize: '1.35rem' }}>
                {currencySymbol}
                {summary.debtRemaining.toLocaleString('es-MX')}
              </span>
              <span className={uiStyles.cardNote}>restante</span>
            </div>
            <div className={styles.debtRow}>
              <span className={styles.debtRowLabel}>Abono de esta semana</span>
              <input
                className={styles.debtInput}
                type="number"
                step="0.01"
                defaultValue={summary.weekAbono || ''}
                placeholder="0"
                onBlur={(event) => handleAbonoCommit(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.colStack}>
          <div>
            <div className={uiStyles.sectionHeader}>
              <span className={uiStyles.sectionLabel}>
                Ingresos · {currencySymbol}
                {summary.totalIncome.toLocaleString('es-MX')}
              </span>
              <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setAddModalOpen(true)} aria-label="Nuevo ingreso">
                <PlusIcon />
              </button>
            </div>
            {summary.income.map((entry) => (
              <EditableMoneyRow
                key={entry.id}
                name={entry.name}
                amount={entry.amount}
                recurrence={entry.recurrence}
                recurrenceOptions={RECURRENCE_SELECT_OPTIONS}
                onRecurrenceCommit={async (recurrence) => {
                  await financeApi.updateEntry(entry.id, { recurrence }, accessToken);
                  load();
                }}
                onNameCommit={async (name) => {
                  await financeApi.updateEntry(entry.id, { name }, accessToken);
                  load();
                }}
                onAmountCommit={async (amount) => {
                  await financeApi.updateEntry(entry.id, { amount }, accessToken);
                  load();
                }}
                onDelete={async () => {
                  await financeApi.deleteEntry(entry.id, accessToken);
                  load();
                }}
              />
            ))}
          </div>

          <AnnualIncomeSection
            entries={annualIncome}
            currencySymbol={currencySymbol}
            onSave={handleSaveAnnualIncome}
            onDelete={handleDeleteAnnualIncome}
          />
        </div>
      </div>

      {isAddModalOpen && (
        <AddMoneyModal
          title="Nuevo ingreso"
          currencySymbol={currencySymbol}
          onClose={() => setAddModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
