'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretLeftIcon, PlusIcon } from '../../../shared/components/icons/icons';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import { EditableMoneyRow } from '../../../shared/components/ui/EditableMoneyRow';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { addWeeks, formatWeekRangeLabel, getCurrentWeekStartIso } from '../../../shared/lib/week';
import { financeApi } from '../services/finance.api';
import { FinanceAnnualIncome, FinanceWeekSummary, MoneyEntryRecurrence, RECURRENCE_LABELS } from '../types/finance.types';
import { nextOccurrence } from '../utils/recurrence';
import { AddMoneyModal } from './AddMoneyModal';
import { AnnualIncomeSection } from './AnnualIncomeSection';
import { FinanceTabs } from './FinanceTabs';
import styles from './finance.module.css';

const RECURRENCE_SELECT_OPTIONS = Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
  value: value as MoneyEntryRecurrence,
  label,
}));

function formatShortDate(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function IngresosView() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStartIso());
  const [summary, setSummary] = useState<FinanceWeekSummary | null>(null);
  const [annualIncome, setAnnualIncome] = useState<FinanceAnnualIncome[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const load = useCallback(async () => {
    const [current, annualIncomeRes] = await Promise.all([
      financeApi.getWeekSummary(weekStartDate, accessToken),
      financeApi.getAnnualIncome(accessToken),
    ]);
    setSummary(current);
    setAnnualIncome(annualIncomeRes);
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
    const entry = annualIncome.find((e) => e.id === id);
    const ok = await confirm(`Estás a punto de borrar el ingreso anual ${entry?.year ?? ''}. ¿Estás seguro?`);
    if (!ok) return;
    await financeApi.deleteAnnualIncome(id, accessToken);
    load();
  };

  const handleDeleteIncomeEntry = async (id: string, name: string) => {
    const ok = await confirm(`Estás a punto de borrar el ingreso "${name}". ¿Estás seguro?`);
    if (!ok) return;
    await financeApi.deleteEntry(id, accessToken);
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

  const currencySymbol = summary.currency === 'mixed' ? '' : summary.currency === 'USD' ? 'US$' : '$';

  return (
    <div className={uiStyles.page}>
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Finanzas</h1>
          <p className={uiStyles.pageSubtitle}>Flujo, presupuesto y posición</p>
        </div>
      </div>

      <FinanceTabs />

      <div className={uiStyles.periodNav}>
        <button type="button" className={uiStyles.iconOnlyButton} onClick={() => setWeekStartDate((d) => addWeeks(d, -1))} aria-label="Semana anterior">
          <CaretLeftIcon />
        </button>
        <span className={uiStyles.periodNavLabel}>{formatWeekRangeLabel(weekStartDate)}</span>
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

      <div>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>
            Ingresos de la semana · {currencySymbol}
            {summary.totalIncome.toLocaleString('es-MX')}
          </span>
          <button
            type="button"
            className={uiStyles.iconOnlyButton}
            onClick={() => setAddModalOpen(true)}
            aria-label="Nuevo ingreso"
            data-tour="finanzas-new-income-button"
          >
            <PlusIcon />
          </button>
        </div>
        {summary.income.length === 0 ? (
          <p className={uiStyles.cardNote}>Sin ingresos registrados esta semana.</p>
        ) : (
          summary.income.map((entry) => {
            const next = nextOccurrence(entry.weekStartDate, entry.recurrence);
            return (
              <div key={entry.id} data-tour="finanzas-income-row">
                <EditableMoneyRow
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
                  onDelete={() => handleDeleteIncomeEntry(entry.id, entry.name)}
                />
                {next && <p className={styles.nextOccurrenceNote}>Próximo {formatShortDate(next)}</p>}
              </div>
            );
          })
        )}
      </div>

      <AnnualIncomeSection
        entries={annualIncome}
        currencySymbol={currencySymbol || '$'}
        onSave={handleSaveAnnualIncome}
        onDelete={handleDeleteAnnualIncome}
      />

      {isAddModalOpen && (
        <AddMoneyModal
          title="Nuevo ingreso"
          currencySymbol={currencySymbol || '$'}
          onClose={() => setAddModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
