'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CaretDownIcon } from '../../../shared/components/icons/icons';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { weeklyLogApi } from '../services/weekly-log.api';
import { AnnualCounter, AnnualProductivitySummary, WeekDetail } from '../types/weekly-log.types';
import { formatPercent } from '../utils/format';
import { AddCounterModal } from './AddCounterModal';
import { CategoryDistributionCard } from './CategoryDistributionCard';
import { CountersSection } from './CountersSection';
import { WeekDetailModal } from './WeekDetailModal';
import { WeekHeatmap } from './WeekHeatmap';
import { WeeksList } from './WeeksList';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function WeeklyLogView() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [summary, setSummary] = useState<AnnualProductivitySummary | null>(null);
  const [counters, setCounters] = useState<AnnualCounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weekDetail, setWeekDetail] = useState<WeekDetail | null>(null);
  const [isCounterModalOpen, setCounterModalOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [yearSummary, yearCounters] = await Promise.all([
        weeklyLogApi.getYear(year, accessToken),
        weeklyLogApi.listCounters(year, accessToken),
      ]);
      setSummary(yearSummary);
      setCounters(yearCounters);
    } finally {
      setIsLoading(false);
    }
  }, [year, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const handleSelectWeek = async (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setWeekDetail(await weeklyLogApi.getWeek(year, weekNumber, accessToken));
  };

  const handleSaveNotes = async (notes: string) => {
    if (selectedWeek === null) return;
    await weeklyLogApi.setWeekNotes(year, selectedWeek, notes, accessToken);
    setSelectedWeek(null);
    setWeekDetail(null);
  };

  const handleCreateCounter = async (name: string, value: number) => {
    await weeklyLogApi.createCounter(name, year, value, accessToken);
    setCounterModalOpen(false);
    // Recarga en vez de solo appendear: el POST no trae previousYearValue
    // (ver comentario en weekly-log.api.ts), así que solo el GET tiene el
    // dato correcto si de verdad existe un contador con ese nombre el año
    // anterior.
    setCounters(await weeklyLogApi.listCounters(year, accessToken));
  };

  const handleDeleteCounter = async (id: string) => {
    const counter = counters.find((c) => c.id === id);
    const ok = await confirm(`Estás a punto de borrar el contador "${counter?.name ?? ''}". ¿Estás seguro?`);
    if (!ok) return;
    await weeklyLogApi.deleteCounter(id, accessToken);
    setCounters((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading || !summary) {
    return (
      <div className={uiStyles.page}>
        <p className={uiStyles.cardNote}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className={uiStyles.page} data-tour="weekly-content">
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Registro semanal</h1>
          <p className={uiStyles.pageSubtitle}>{summary.weeksWithData} de 52 semanas registradas</p>
        </div>
        <div className={uiStyles.selectWrap}>
          <select className={uiStyles.select} value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <CaretDownIcon className={uiStyles.selectCaret} />
        </div>
      </div>

      <div className={uiStyles.card}>
        <p className={uiStyles.cardLabel}>Productividad anual {year}</p>
        <p className={uiStyles.bigStat}>
          {formatPercent(summary.annualPercent)}%{' '}
          <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
            promedio de {summary.weeksWithData} semanas registradas
          </span>
        </p>
        <div className={uiStyles.progressTrack} style={{ marginBottom: '0.75rem' }}>
          <div className={uiStyles.progressFill} style={{ width: `${summary.annualPercent ?? 0}%` }} />
        </div>
        <p className={uiStyles.cardNote}>
          Meta ideal = horas del año, menos sueño, menos rutina fija — el resto es tu capacidad productiva real por
          semana.
        </p>
      </div>

      <div>
        <p className={uiStyles.sectionLabel} style={{ marginBottom: '0.5rem' }}>
          Mapa de semanas
        </p>
        <WeekHeatmap weeks={summary.weeks} onSelectWeek={handleSelectWeek} />
      </div>

      <WeeksList weeks={summary.weeks} onSelectWeek={handleSelectWeek} />

      <CategoryDistributionCard categories={summary.categoryDistribution} />

      <CountersSection
        counters={counters}
        year={year}
        onAddClick={() => setCounterModalOpen(true)}
        onDelete={handleDeleteCounter}
      />

      {weekDetail && <WeekDetailModal detail={weekDetail} onClose={() => { setSelectedWeek(null); setWeekDetail(null); }} onSaveNotes={handleSaveNotes} />}
      {isCounterModalOpen && <AddCounterModal onClose={() => setCounterModalOpen(false)} onCreate={handleCreateCounter} />}
    </div>
  );
}
