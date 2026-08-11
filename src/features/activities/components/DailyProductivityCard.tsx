'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { activitiesApi } from '../services/activities.api';
import { DailyProductivity } from '../types/activities.types';

// Productividad = horas de actividades registradas / (24 - horas de sueño
// de ese día). El sueño se muestra como dato estadístico (cuánto dormiste),
// nunca como parte de la productividad -- ver GetDailyProductivityUseCase
// en el backend para el detalle de cómo se evita contar dos veces el
// horario de una rutina de sueño vinculada a una actividad.
export function DailyProductivityCard({ dateIso }: { dateIso: string }) {
  const { accessToken } = useAuth();
  const [data, setData] = useState<DailyProductivity | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    activitiesApi.getDailyProductivity(dateIso, accessToken).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [dateIso, accessToken]);

  if (!data) return null;

  return (
    <div className={uiStyles.card}>
      <p className={uiStyles.cardLabel}>Productividad del día</p>
      {data.percent !== null ? (
        <>
          <p className={uiStyles.bigStat}>{data.percent}%</p>
          <div className={uiStyles.progressTrack} style={{ marginBottom: '0.6rem' }}>
            <div className={uiStyles.progressFill} style={{ transform: `scaleX(${data.percent / 100})` }} />
          </div>
          <p className={uiStyles.cardNote}>
            {data.activityHours}h de actividades sobre {data.targetHours}h disponibles
            {data.sleepHours > 0 ? ` (24h − ${data.sleepHours}h de sueño)` : ''}.
          </p>
        </>
      ) : (
        <p className={uiStyles.cardNote}>No se pudo calcular la productividad de hoy.</p>
      )}
    </div>
  );
}
