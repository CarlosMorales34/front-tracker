'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { MinusIcon, PlusIcon, TrendDownIcon, TrendUpIcon } from '../../../shared/components/icons/icons';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import { Spinner } from '../../../shared/components/ui/Spinner';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { getTodayIso } from '../../../shared/lib/week';
import { bodyProgressApi } from '../services/body-progress.api';
import { BodyMeasurement, BodyProgressSummary, MeasurementFields, SetGoalInput } from '../types/body-progress.types';
import { periodRange, TREND_PERIODS, TrendPeriod } from '../utils/period';
import { formatSignedKg, formatWeightKg } from '../utils/units';
import { GoalModal } from './GoalModal';
import { MeasurementModal } from './MeasurementModal';
import { RecentMeasurements } from './RecentMeasurements';
import { TrendChart } from './TrendChart';
import styles from './body-progress.module.css';

const RECENT_COUNT = 5;

export function BodyProgressView() {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [summary, setSummary] = useState<BodyProgressSummary | null>(null);
  const [recentMeasurements, setRecentMeasurements] = useState<BodyMeasurement[]>([]);
  const [period, setPeriod] = useState<TrendPeriod>('3M');
  const [periodMeasurements, setPeriodMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);

  const loadSummaryAndRecent = useCallback(async () => {
    const today = getTodayIso();
    const [nextSummary, yearMeasurements] = await Promise.all([
      bodyProgressApi.getSummary(accessToken),
      bodyProgressApi.listMeasurements(periodRange('1A', today).from, today, accessToken),
    ]);
    setSummary(nextSummary);
    setRecentMeasurements(yearMeasurements.slice(-RECENT_COUNT));
  }, [accessToken]);

  const loadPeriod = useCallback(
    async (targetPeriod: TrendPeriod) => {
      const { from, to } = periodRange(targetPeriod, getTodayIso());
      setPeriodMeasurements(await bodyProgressApi.listMeasurements(from, to, accessToken));
    },
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    setLoadError(false);
    Promise.all([loadSummaryAndRecent(), loadPeriod(period)])
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
    // Solo al montar / cuando cambia accessToken -- cambios de período los
    // maneja el otro efecto de abajo, para no re-disparar todo el summary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) loadPeriod(period);
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [period, accessToken, loadPeriod]);

  const handleSaveMeasurement = async (fields: MeasurementFields) => {
    if (editingMeasurement) {
      await bodyProgressApi.updateMeasurement(editingMeasurement.id, fields, accessToken);
    } else {
      await bodyProgressApi.createMeasurement(fields, accessToken);
    }
    setMeasurementModalOpen(false);
    setEditingMeasurement(null);
    await Promise.all([loadSummaryAndRecent(), loadPeriod(period)]);
  };

  const handleDeleteMeasurement = async (measurement: BodyMeasurement) => {
    const ok = await confirm('Estás a punto de borrar esta medición. ¿Estás seguro?');
    if (!ok) return;
    await bodyProgressApi.deleteMeasurement(measurement.id, accessToken);
    await Promise.all([loadSummaryAndRecent(), loadPeriod(period)]);
  };

  const handleSaveGoal = async (input: SetGoalInput) => {
    await bodyProgressApi.setGoal(input, accessToken);
    setGoalModalOpen(false);
    await loadSummaryAndRecent();
  };

  if (isLoading) return <Spinner />;
  if (loadError || !summary) {
    return <p className={uiStyles.cardNote}>No se pudo cargar tu progreso corporal.</p>;
  }

  const TrendIcon = summary.trend === 'up' ? TrendUpIcon : summary.trend === 'down' ? TrendDownIcon : MinusIcon;
  const deltaClass =
    summary.isProgressFavorable === true
      ? styles.deltaGood
      : summary.isProgressFavorable === false
        ? styles.deltaBad
        : styles.deltaNeutral;

  return (
    <div>
      <div className={uiStyles.sectionHeader}>
        <span className={uiStyles.sectionLabel}>Progreso corporal</span>
        <button
          type="button"
          className={uiStyles.modalPrimaryButton}
          onClick={() => {
            setEditingMeasurement(null);
            setMeasurementModalOpen(true);
          }}
        >
          <PlusIcon /> Registrar
        </button>
      </div>

      {!summary.goal ? (
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Sin objetivo todavía</p>
          <p className={uiStyles.cardNote}>Fija una meta para poder ver tu avance.</p>
          <button
            type="button"
            className={uiStyles.outlineButton}
            style={{ marginTop: '0.7rem' }}
            onClick={() => setGoalModalOpen(true)}
          >
            Fijar meta
          </button>
        </div>
      ) : (
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Peso actual</p>
          <p className={uiStyles.bigStat}>
            {summary.currentWeightKg !== null ? `${formatWeightKg(summary.currentWeightKg)} kg` : 'Sin mediciones'}
          </p>
          {summary.deltaVsPreviousPeriod !== null && (
            <p className={deltaClass}>
              <TrendIcon width={14} height={14} /> {formatSignedKg(summary.deltaVsPreviousPeriod)} kg este mes
            </p>
          )}
          <div className={styles.goalRow}>
            <span>
              Inicio <strong>{formatWeightKg(summary.goal.startWeightKg)} kg</strong>
            </span>
            <span>
              Meta{' '}
              <strong>
                {summary.goal.targetWeightKg !== null ? `${formatWeightKg(summary.goal.targetWeightKg)} kg` : '—'}
              </strong>
            </span>
          </div>
          {summary.percentProgress !== null && (
            <div className={uiStyles.progressTrack} style={{ marginTop: '0.6rem' }}>
              <div
                className={uiStyles.progressFill}
                style={{ transform: `scaleX(${Math.min(Math.max(summary.percentProgress, 0), 100) / 100})` }}
              />
            </div>
          )}
          <button type="button" className={styles.changeGoalLink} onClick={() => setGoalModalOpen(true)}>
            Cambiar meta
          </button>
        </div>
      )}

      <div className={styles.statChipsGrid}>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Progreso</p>
          <p className={uiStyles.midStat}>{formatSignedKg(summary.totalChangeSinceStart)} kg</p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Restante</p>
          <p className={uiStyles.midStat}>
            {summary.distanceToGoal !== null ? Math.abs(summary.distanceToGoal).toFixed(1) : '–'} kg
          </p>
        </div>
        <div className={uiStyles.card}>
          <p className={uiStyles.cardLabel}>Ritmo</p>
          <p className={uiStyles.midStat}>{formatSignedKg(summary.weeklyPaceKg)}/sem</p>
        </div>
      </div>

      <div className={uiStyles.card}>
        <div className={uiStyles.sectionHeader}>
          <span className={uiStyles.sectionLabel}>Tendencia</span>
          <div className={styles.periodToggle}>
            {TREND_PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                data-selected={period === option.value}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart measurements={periodMeasurements} targetWeightKg={summary.goal?.targetWeightKg ?? null} />
      </div>

      <div>
        <p className={uiStyles.sectionLabel} style={{ marginBottom: '0.5rem' }}>
          Mediciones recientes
        </p>
        <RecentMeasurements
          measurements={recentMeasurements}
          onEdit={(measurement) => {
            setEditingMeasurement(measurement);
            setMeasurementModalOpen(true);
          }}
          onDelete={handleDeleteMeasurement}
        />
      </div>

      {isMeasurementModalOpen && (
        <MeasurementModal
          measurement={editingMeasurement ?? undefined}
          onClose={() => {
            setMeasurementModalOpen(false);
            setEditingMeasurement(null);
          }}
          onSave={handleSaveMeasurement}
        />
      )}
      {isGoalModalOpen && (
        <GoalModal
          currentGoal={summary.goal}
          currentWeightKg={summary.currentWeightKg}
          onClose={() => setGoalModalOpen(false)}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}
