'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretDownIcon, CaretLeftIcon, WarningIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { addWeeks, formatWeekRangeLabel, getCurrentWeekStartIso, getWeekNumberForYear } from '../../../shared/lib/week';
import { financeApi } from '../services/finance.api';
import { FinanceWeekSummary, MonthlyBudgetSummary, SavingsSummary } from '../types/finance.types';
import { getWeekNumberFromAnchor } from '../utils/week';
import { FinanceTabs } from './FinanceTabs';
import { MonthlyBudgetCard, monthLabelFor } from './MonthlyBudgetCard';
import styles from './finance.module.css';

export function ResumenView() {
  const { accessToken } = useAuth();
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStartIso());
  const [summary, setSummary] = useState<FinanceWeekSummary | null>(null);
  const [lastYearBalance, setLastYearBalance] = useState<number | null>(null);
  const [budget, setBudget] = useState<MonthlyBudgetSummary | null>(null);
  const [savings, setSavings] = useState<SavingsSummary | null>(null);
  const [anchorError, setAnchorError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const weekStartDateLocal = new Date(`${weekStartDate}T00:00:00`);
    const year = weekStartDateLocal.getFullYear();
    const month = weekStartDateLocal.getMonth() + 1;

    const [current, lastYear, budgetSummary, savingsSummary] = await Promise.all([
      financeApi.getWeekSummary(weekStartDate, accessToken),
      financeApi.getWeekSummary(addWeeks(weekStartDate, -52), accessToken),
      financeApi.getMonthlyBudget(year, month, accessToken),
      financeApi.getSavingsSummary(year, accessToken),
    ]);
    setSummary(current);
    setLastYearBalance(lastYear.balance);
    setBudget(budgetSummary);
    setSavings(savingsSummary);
  }, [weekStartDate, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleCurrencyChange = async (currency: 'MXN' | 'USD') => {
    await financeApi.updateSettings({ currency }, accessToken);
    load();
  };

  const handleWeek1AnchorCommit = async (rawValue: string) => {
    setAnchorError(null);
    try {
      await financeApi.updateSettings({ week1AnchorDate: rawValue || null }, accessToken);
      load();
    } catch (err) {
      setAnchorError(err instanceof Error ? err.message : 'No se pudo guardar la fecha ancla.');
    }
  };

  const handleSaveBudget = async (amount: number) => {
    const weekStartDateLocal = new Date(`${weekStartDate}T00:00:00`);
    await financeApi.updateMonthlyBudget(weekStartDateLocal.getFullYear(), weekStartDateLocal.getMonth() + 1, amount, accessToken);
    load();
  };

  if (!summary || !budget || !savings) {
    return (
      <div className={uiStyles.page}>
        <FinanceTabs />
        <Spinner />
      </div>
    );
  }

  const currencySymbol = summary.currency === 'mixed' ? '' : summary.currency === 'USD' ? 'US$' : '$';
  const isMixedCurrency = summary.currency === 'mixed';
  const weekStartDateLocal = new Date(`${weekStartDate}T00:00:00`);
  const weekNumber = summary.week1AnchorDate
    ? getWeekNumberFromAnchor(weekStartDate, summary.week1AnchorDate)
    : getWeekNumberForYear(weekStartDate, weekStartDateLocal.getFullYear());
  const currentYear = weekStartDateLocal.getFullYear();
  const vsLastYear = lastYearBalance !== null ? summary.balance - lastYearBalance : null;

  return (
    <div className={uiStyles.page}>
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Finanzas</h1>
          <p className={uiStyles.pageSubtitle}>Flujo, presupuesto y posición</p>
        </div>
        <div className={uiStyles.selectWrap}>
          <select
            className={uiStyles.select}
            value={summary.currency === 'mixed' ? '' : summary.currency}
            onChange={(event) => handleCurrencyChange(event.target.value as 'MXN' | 'USD')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
          <CaretDownIcon className={uiStyles.selectCaret} />
        </div>
      </div>

      <FinanceTabs />

      <div className={styles.week1AnchorRow}>
        <span className={styles.week1AnchorLabel}>Semana 1 empieza</span>
        <input
          type="date"
          className={styles.week1AnchorInput}
          defaultValue={summary.week1AnchorDate ?? ''}
          onBlur={(event) => handleWeek1AnchorCommit(event.target.value)}
        />
      </div>
      {anchorError && <p className={uiStyles.cardNote} style={{ color: 'var(--color-danger)' }}>{anchorError}</p>}

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

      {isMixedCurrency ? (
        <div className={uiStyles.card}>
          <p className={uiStyles.cardNote}>
            Esta semana tiene ingresos en más de una moneda -- el flujo semanal no se puede mostrar como una sola cifra confiable.
          </p>
        </div>
      ) : (
        <>
          {summary.balance < 0 && (
            <div className={uiStyles.alertBanner}>
              <WarningIcon />
              <span>
                El flujo semanal terminó {currencySymbol}
                {Math.abs(summary.balance).toLocaleString('es-MX')} por debajo de cero.
              </span>
            </div>
          )}

          <div className={uiStyles.card}>
            <p className={uiStyles.cardLabel}>Flujo de la semana</p>
            <p className={uiStyles.bigStat} style={{ color: summary.balance >= 0 ? 'var(--color-accent)' : 'var(--color-text)' }}>
              {summary.balance < 0 ? '-' : ''}
              {currencySymbol}
              {Math.abs(summary.balance).toLocaleString('es-MX')}
            </p>
            {vsLastYear !== null && (
              <p className={uiStyles.cardNote}>
                vs. {vsLastYear >= 0 ? '' : '-'}
                {currencySymbol}
                {Math.abs(vsLastYear).toLocaleString('es-MX')} en el mismo periodo de {currentYear - 1}
              </p>
            )}
            <div className={styles.flowRow}>
              <span>Ingresos {currencySymbol}{summary.totalIncome.toLocaleString('es-MX')}</span>
              <span>Gastos {currencySymbol}{summary.totalExpense.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </>
      )}

      <MonthlyBudgetCard
        summary={budget}
        monthLabel={monthLabelFor(budget.year, budget.month)}
        currencySymbol={currencySymbol || '$'}
        onSave={handleSaveBudget}
      />

      <div className={uiStyles.card}>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>Acumulado anual</span>
          <span className={uiStyles.cardNote}>Hasta esta semana</span>
        </div>
        <div className={uiStyles.metricGrid2}>
          <div>
            <p className={uiStyles.cardLabel}>Ahorro neto {savings.year}</p>
            <p className={uiStyles.midStat}>
              {savings.accumulated < 0 ? '-' : ''}
              {currencySymbol || '$'}
              {Math.abs(savings.accumulated).toLocaleString('es-MX')}
            </p>
            <p className={uiStyles.cardNote} style={{ color: savings.thisMonth >= 0 ? 'var(--color-accent)' : undefined }}>
              {savings.thisMonth >= 0 ? '+' : '-'}
              {currencySymbol || '$'}
              {Math.abs(savings.thisMonth).toLocaleString('es-MX')} este mes
            </p>
          </div>
          {vsLastYear !== null && lastYearBalance !== null && lastYearBalance !== 0 && (
            <div>
              <p className={uiStyles.cardLabel}>vs. mismo periodo</p>
              <p className={uiStyles.midStat}>
                {vsLastYear >= 0 ? '+' : ''}
                {Math.round((vsLastYear / Math.abs(lastYearBalance)) * 100)}%
              </p>
              <p className={uiStyles.cardNote}>comparación {currentYear - 1}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
