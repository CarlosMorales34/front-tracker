'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretLeftIcon, PlusIcon } from '../../../shared/components/icons/icons';
import { EditableMoneyRow } from '../../../shared/components/ui/EditableMoneyRow';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { financeApi } from '../../finance/services/finance.api';
import { expensesApi } from '../services/expenses.api';
import { DailyExpense, ExpensesSummary, FixedMonthlyExpense } from '../types/expenses.types';
import { addDays, formatDayLabel, getTodayIso } from '../utils/day';
import { AddExpenseModal } from './AddExpenseModal';

export function ExpensesView() {
  const { accessToken } = useAuth();
  const [dateIso, setDateIso] = useState(getTodayIso());
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedMonthlyExpense[]>([]);
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState<'daily' | 'fixed' | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [daily, fixed, expensesSummary, financeSettings] = await Promise.all([
        expensesApi.listDaily(dateIso, accessToken),
        expensesApi.listFixed(accessToken),
        expensesApi.getSummary(dateIso, accessToken),
        financeApi.getSettings(accessToken),
      ]);
      setDailyExpenses(daily);
      setFixedExpenses(fixed);
      setSummary(expensesSummary);
      setCurrencySymbol(financeSettings.currency === 'USD' ? 'US$' : '$');
    } finally {
      setIsLoading(false);
    }
  }, [dateIso, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const todayTotal = dailyExpenses.reduce((sum, item) => sum + item.amount, 0);
  const fixedTotal = fixedExpenses.reduce((sum, item) => sum + item.amount, 0);

  const handleCreate = async (name: string, amount: number) => {
    if (addModal === 'daily') {
      const created = await expensesApi.createDaily(name, amount, dateIso, accessToken);
      setDailyExpenses((prev) => [...prev, created]);
    } else if (addModal === 'fixed') {
      const created = await expensesApi.createFixed(name, amount, accessToken);
      setFixedExpenses((prev) => [...prev, created]);
    }
    setAddModal(null);
    load();
  };

  if (isLoading || !summary) {
    return (
      <div className={uiStyles.page}>
        <p className={uiStyles.cardNote}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className={uiStyles.page}>
      <div>
        <h1 className={uiStyles.pageTitle}>Gastos diarios</h1>
        <p className={uiStyles.pageSubtitle}>Alimenta el gasto semanal y mensual de Finanzas</p>
      </div>

      <div className={uiStyles.metricGrid3}>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Ingresos del mes</p>
          <p className={uiStyles.midStat}>
            {currencySymbol}
            {summary.monthIncome.toLocaleString('es-MX')}
          </p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Gastos del mes</p>
          <p className={uiStyles.midStat}>
            {currencySymbol}
            {summary.monthExpenseTotal.toLocaleString('es-MX')}
          </p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Sobrante</p>
          <p className={uiStyles.midStat} style={{ color: 'var(--color-accent)' }}>
            {currencySymbol}
            {summary.sobrante.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      <div className={uiStyles.periodNav}>
        <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setDateIso((d) => addDays(d, -1))} aria-label="Día anterior">
          <CaretLeftIcon />
        </button>
        <span className={uiStyles.periodNavLabel}>{formatDayLabel(dateIso)}</span>
        <button
          type="button"
          className={uiStyles.iconOnlyButton}
          onClick={() => setDateIso((d) => addDays(d, 1))}
          aria-label="Día siguiente"
          style={{ transform: 'scaleX(-1)' }}
        >
          <CaretLeftIcon />
        </button>
      </div>

      <div>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>
            Gastos de hoy · {currencySymbol}
            {todayTotal.toLocaleString('es-MX')}
          </span>
          <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setAddModal('daily')} aria-label="Nuevo gasto">
            <PlusIcon />
          </button>
        </div>
        {dailyExpenses.length === 0 ? (
          <p className={uiStyles.cardNote}>Sin gastos registrados hoy.</p>
        ) : (
          dailyExpenses.map((item) => (
            <EditableMoneyRow
              key={item.id}
              name={item.name}
              amount={item.amount}
              onNameCommit={async (name) => {
                await expensesApi.updateDaily(item.id, { name }, accessToken);
                setDailyExpenses((prev) => prev.map((e) => (e.id === item.id ? { ...e, name } : e)));
              }}
              onAmountCommit={async (amount) => {
                await expensesApi.updateDaily(item.id, { amount }, accessToken);
                setDailyExpenses((prev) => prev.map((e) => (e.id === item.id ? { ...e, amount } : e)));
                load();
              }}
              onDelete={async () => {
                await expensesApi.deleteDaily(item.id, accessToken);
                setDailyExpenses((prev) => prev.filter((e) => e.id !== item.id));
                load();
              }}
            />
          ))
        )}
      </div>

      <div className={uiStyles.metricGrid2}>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Total esta semana</p>
          <p className={uiStyles.midStat}>
            {currencySymbol}
            {summary.weekTotal.toLocaleString('es-MX')}
          </p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Total este mes</p>
          <p className={uiStyles.midStat}>
            {currencySymbol}
            {summary.monthDailyTotal.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      <div>
        <div className={uiStyles.sectionHeader}>
          <div>
            <span className={uiStyles.sectionLabel}>
              Gastos programados del mes · {currencySymbol}
              {fixedTotal.toLocaleString('es-MX')}
            </span>
            <p className={uiStyles.cardNote} style={{ marginTop: '0.2rem' }}>
              Seguros, coach, suscripciones — pagos fijos separados del gasto variable
            </p>
          </div>
          <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setAddModal('fixed')} aria-label="Nuevo gasto programado">
            <PlusIcon />
          </button>
        </div>
        {fixedExpenses.map((item) => (
          <EditableMoneyRow
            key={item.id}
            name={item.name}
            amount={item.amount}
            onNameCommit={async (name) => {
              await expensesApi.updateFixed(item.id, { name }, accessToken);
              setFixedExpenses((prev) => prev.map((e) => (e.id === item.id ? { ...e, name } : e)));
            }}
            onAmountCommit={async (amount) => {
              await expensesApi.updateFixed(item.id, { amount }, accessToken);
              setFixedExpenses((prev) => prev.map((e) => (e.id === item.id ? { ...e, amount } : e)));
              load();
            }}
            onDelete={async () => {
              await expensesApi.deleteFixed(item.id, accessToken);
              setFixedExpenses((prev) => prev.filter((e) => e.id !== item.id));
              load();
            }}
          />
        ))}
      </div>

      {addModal && (
        <AddExpenseModal
          title={addModal === 'daily' ? 'Nuevo gasto de hoy' : 'Nuevo gasto programado'}
          currencySymbol={currencySymbol}
          onClose={() => setAddModal(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
