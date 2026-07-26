'use client';

import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  BarbellIcon,
  CaretDownIcon,
  MinusIcon,
  PencilIcon,
  ScaleIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '../../../shared/components/icons/icons';
import { weightApi } from '../services/weight.api';
import { WeightGoalDirection, WeightYearExtreme, WeightYearSummary } from '../types/weight.types';
import { formatDelta, formatKg } from '../utils/format';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import styles from './weight.module.css';
import { WeightExtremesChart } from './WeightExtremesChart';
import { WeightNoteModal } from './WeightNoteModal';
import { WeightTrendChart } from './WeightTrendChart';
import { WorkoutsTab } from './WorkoutsTab';

type PesoTab = 'peso' | 'entrenamientos';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 4 + i);

// Enter guarda igual que salir del campo -- dispara blur() para reusar el
// mismo handler onBlur en vez de duplicar la lógica de guardado.
function commitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.blur();
  }
}

export function WeightView() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<PesoTab>('peso');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [summary, setSummary] = useState<WeightYearSummary | null>(null);
  const [extremes, setExtremes] = useState<WeightYearExtreme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteModalMonth, setNoteModalMonth] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [yearSummary, yearlyExtremes] = await Promise.all([
        weightApi.getYear(year, accessToken),
        weightApi.getYearlyExtremes(accessToken),
      ]);
      setSummary(yearSummary);
      setExtremes(yearlyExtremes);
    } finally {
      setIsLoading(false);
    }
  }, [year, accessToken]);

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, load]);

  const trend = useMemo(() => {
    const delta = summary?.deltaVsPreviousMonth ?? null;
    if (delta === null) return { icon: MinusIcon, label: 'Estable' };
    if (delta < -0.1) return { icon: TrendDownIcon, label: 'Bajando' };
    if (delta > 0.1) return { icon: TrendUpIcon, label: 'Subiendo' };
    return { icon: MinusIcon, label: 'Estable' };
  }, [summary]);

  const handleMonthValueCommit = async (month: number, rawValue: string) => {
    const value = rawValue.trim() === '' ? null : Number(rawValue);
    if (value !== null && !Number.isFinite(value)) return;
    const updated = await weightApi.setMonthValue(year, month, value, accessToken);
    setSummary((prev) =>
      prev
        ? { ...prev, months: prev.months.map((m) => (m.month === month ? { ...m, value: updated.value } : m)) }
        : prev
    );
    load();
  };

  const handleSaveNote = async (note: string) => {
    if (noteModalMonth === null) return;
    const updated = await weightApi.setMonthNote(year, noteModalMonth, note, accessToken);
    setSummary((prev) =>
      prev
        ? { ...prev, months: prev.months.map((m) => (m.month === noteModalMonth ? { ...m, note: updated.note } : m)) }
        : prev
    );
    setNoteModalMonth(null);
  };

  const handleGoalCommit = async (rawValue: string) => {
    if (!summary) return;
    const goalKg = Number(rawValue);
    if (!Number.isFinite(goalKg) || goalKg <= 0) return;
    await weightApi.updateSettings(goalKg, summary.goalDirection, accessToken);
    setSummary((prev) => (prev ? { ...prev, goalKg } : prev));
    load();
  };

  const handleDirectionChange = async (goalDirection: WeightGoalDirection) => {
    if (!summary) return;
    await weightApi.updateSettings(summary.goalKg, goalDirection, accessToken);
    setSummary((prev) => (prev ? { ...prev, goalDirection } : prev));
    load();
  };

  const monthWithNoteModal =
    noteModalMonth !== null ? summary?.months.find((m) => m.month === noteModalMonth) ?? null : null;

  if (isLoading || !summary) {
    return (
      <div className={uiStyles.page}>
        <p className={uiStyles.cardNote}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className={uiStyles.page}>
      <div className={uiStyles.pageHeader}>
        <div>
          <h1 className={uiStyles.pageTitle}>Peso</h1>
          <p className={uiStyles.pageSubtitle}>Registro mensual</p>
        </div>
        {tab === 'peso' && (
          <div className={uiStyles.selectWrap}>
            <select
              className={uiStyles.select}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <CaretDownIcon className={uiStyles.selectCaret} />
          </div>
        )}
      </div>

      <div className={styles.pesoTabToggle} data-tour="peso-toggle">
        <button type="button" data-selected={tab === 'peso'} onClick={() => setTab('peso')}>
          <ScaleIcon width={13} height={13} /> Registro de peso
        </button>
        <button type="button" data-selected={tab === 'entrenamientos'} onClick={() => setTab('entrenamientos')}>
          <BarbellIcon width={13} height={13} /> Entrenamientos
        </button>
      </div>

      {tab === 'entrenamientos' ? (
        <WorkoutsTab />
      ) : (
        <>
      <div className={uiStyles.metricGrid2}>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Peso actual</p>
          <p className={uiStyles.midStat}>{formatKg(summary.currentWeight)} kg</p>
          <p className={uiStyles.cardNote}>Meta {formatKg(summary.goalKg)} kg</p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Cambio del mes</p>
          <p className={uiStyles.midStat}>{formatDelta(summary.deltaVsPreviousMonth)} kg</p>
          <p className={uiStyles.cardNote}>vs. mes anterior</p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Mejor histórico</p>
          <p className={uiStyles.midStat}>{summary.bestEver ? formatKg(summary.bestEver.value) : '–'} kg</p>
          <p className={uiStyles.cardNote}>
            {summary.bestEver ? `${MONTH_NAMES[summary.bestEver.month - 1]} ${summary.bestEver.year}` : ''}
          </p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Tendencia</p>
          <div className={styles.trendRow}>
            <trend.icon width={18} height={18} />
            <span>{trend.label}</span>
          </div>
        </div>
      </div>

      <div className={uiStyles.card}>
        <p className={uiStyles.cardLabel}>Tendencia {year}</p>
        <WeightTrendChart months={summary.months} goalKg={summary.goalKg} />
      </div>

      <div className={styles.goalRow}>
        <span className={styles.goalRowLabel}>Meta de peso</span>
        <input
          className={styles.monthInput}
          type="number"
          step="0.1"
          defaultValue={summary.goalKg}
          onBlur={(event) => handleGoalCommit(event.target.value)}
          onKeyDown={commitOnEnter}
        />
        <span className={styles.goalRowUnit}>kg</span>
      </div>

      <div className={styles.directionRow}>
        <span className={styles.goalRowLabel}>Mi meta es</span>
        <div className={uiStyles.selectWrap} style={{ flexShrink: 0 }}>
          <button
            type="button"
            className={styles.directionOption}
            data-selected={summary.goalDirection === 'lose'}
            onClick={() => handleDirectionChange('lose')}
          >
            Bajar de peso
          </button>
          <button
            type="button"
            className={styles.directionOption}
            data-selected={summary.goalDirection === 'gain'}
            onClick={() => handleDirectionChange('gain')}
          >
            Subir de peso
          </button>
        </div>
      </div>

      <div>
        <p className={uiStyles.sectionLabel}>Registro por mes</p>
        <div className={styles.monthList}>
          {summary.months.map((monthEntry, index) => {
            const prevValue = index > 0 ? summary.months[index - 1]?.value ?? null : null;
            const delta = monthEntry.value !== null && prevValue !== null ? monthEntry.value - prevValue : null;
            return (
              <div key={monthEntry.month} className={styles.monthRow}>
                <span className={styles.monthName}>{MONTH_NAMES[monthEntry.month - 1]}</span>
                <input
                  className={styles.monthInput}
                  type="number"
                  step="0.1"
                  placeholder="–"
                  defaultValue={monthEntry.value ?? ''}
                  onBlur={(event) => handleMonthValueCommit(monthEntry.month, event.target.value)}
                  onKeyDown={commitOnEnter}
                />
                <span className={styles.monthDelta}>{formatDelta(delta)}</span>
                <button
                  type="button"
                  className={uiStyles.iconInlineButton}
                  onClick={() => setNoteModalMonth(monthEntry.month)}
                  aria-label={`Nota de ${MONTH_NAMES[monthEntry.month - 1]}`}
                  style={monthEntry.note ? { color: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : undefined}
                >
                  <PencilIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {extremes.length > 0 && (
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Mejores / peores meses por año</p>
          <WeightExtremesChart extremes={extremes} goalDirection={summary.goalDirection} />
        </div>
      )}

      {monthWithNoteModal && (
        <WeightNoteModal
          monthLabel={`${MONTH_NAMES[monthWithNoteModal.month - 1]} ${year}`}
          initialNote={monthWithNoteModal.note ?? ''}
          onClose={() => setNoteModalMonth(null)}
          onSave={handleSaveNote}
        />
      )}
        </>
      )}
    </div>
  );
}
