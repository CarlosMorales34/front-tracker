'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretDownIcon, CaretLeftIcon, PlusIcon, WarningIcon } from '../../../shared/components/icons/icons';
import { EditableMoneyRow } from '../../../shared/components/ui/EditableMoneyRow';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { addWeeks, formatWeekRangeLabel, getCurrentWeekStartIso, getWeekNumberForYear } from '../../../shared/lib/week';
import { financeApi } from '../services/finance.api';
import { FinanceWeekSummary, MoneyEntryType } from '../types/finance.types';
import { AddMoneyModal } from './AddMoneyModal';
import styles from './finance.module.css';

export function FinanceView() {
  const { accessToken } = useAuth();
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStartIso());
  const [summary, setSummary] = useState<FinanceWeekSummary | null>(null);
  const [lastYearBalance, setLastYearBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState<MoneyEntryType | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [current, lastYear] = await Promise.all([
        financeApi.getWeekSummary(weekStartDate, accessToken),
        financeApi.getWeekSummary(addWeeks(weekStartDate, -52), accessToken),
      ]);
      setSummary(current);
      setLastYearBalance(lastYear.totalIncome - lastYear.totalExpense);
    } finally {
      setIsLoading(false);
    }
  }, [weekStartDate, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleCreate = async (name: string, amount: number) => {
    if (!addModal) return;
    await financeApi.createEntry(addModal, name, amount, weekStartDate, accessToken);
    setAddModal(null);
    load();
  };

  const handleCurrencyChange = async (currency: 'MXN' | 'USD') => {
    await financeApi.updateSettings({ currency }, accessToken);
    load();
  };

  const handleAbonoCommit = async (rawValue: string) => {
    const amount = Number(rawValue);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await financeApi.addDebtPayment(weekStartDate, amount, accessToken);
    load();
  };

  if (isLoading || !summary) {
    return (
      <div className={uiStyles.page}>
        <p className={uiStyles.cardNote}>Cargando…</p>
      </div>
    );
  }

  const currencySymbol = summary.currency === 'USD' ? 'US$' : '$';
  const balance = summary.totalIncome - summary.totalExpense;
  const weekNumber = getWeekNumberForYear(weekStartDate, new Date(weekStartDate).getFullYear());
  const currentYear = new Date(weekStartDate).getFullYear();
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
              {summary.totalIncome.toLocaleString('es-MX')} · Gastos {currencySymbol}
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
              <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setAddModal('income')} aria-label="Nuevo ingreso">
                <PlusIcon />
              </button>
            </div>
            {summary.income.map((entry) => (
              <EditableMoneyRow
                key={entry.id}
                name={entry.name}
                amount={entry.amount}
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

          <div>
            <div className={uiStyles.sectionHeader}>
              <span className={uiStyles.sectionLabel}>
                Gastos · {currencySymbol}
                {summary.totalExpense.toLocaleString('es-MX')}
              </span>
              <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setAddModal('expense')} aria-label="Nuevo gasto">
                <PlusIcon />
              </button>
            </div>
            {summary.expense.map((entry) => (
              <EditableMoneyRow
                key={entry.id}
                name={entry.name}
                amount={entry.amount}
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
        </div>
      </div>

      {addModal && (
        <AddMoneyModal
          title={addModal === 'income' ? 'Nuevo ingreso' : 'Nuevo gasto'}
          currencySymbol={currencySymbol}
          onClose={() => setAddModal(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
