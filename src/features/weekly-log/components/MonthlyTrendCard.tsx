import { TrendDownIcon, TrendUpIcon } from '../../../shared/components/icons/icons';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { WeeklyTrend } from '../types/weekly-log.types';
import styles from './weekly-log.module.css';

// Tendencia mensual (últimas 4 semanas vs las 4 anteriores) -- mismo
// espíritu que "Ingresos anuales" en Finanzas (comparar contra el período
// anterior), pero acotado a un mes rodante en vez del histórico completo
// del año, y como una oración generada en vez de solo un % -- acá también
// importa CUÁLES categorías subieron/bajaron, no solo el número global.
export function MonthlyTrendCard({ trend }: { trend: WeeklyTrend }) {
  if (!trend.summary) {
    return (
      <div className={uiStyles.card}>
        <p className={uiStyles.cardLabel}>Tendencia mensual</p>
        <p className={uiStyles.cardNote}>Registra actividades esta semana para empezar a ver tu tendencia mensual.</p>
      </div>
    );
  }

  const delta = trend.deltaPercent;

  return (
    <div className={uiStyles.card}>
      <div className={uiStyles.sectionHeader} style={{ marginBottom: '0.5rem' }}>
        <span className={uiStyles.cardLabel} style={{ marginBottom: 0 }}>
          Tendencia mensual
        </span>
        {delta !== null && delta !== 0 && (
          <span className={delta > 0 ? styles.trendPositive : styles.trendNegative}>
            {delta > 0 ? <TrendUpIcon /> : <TrendDownIcon />}
            {delta > 0 ? '+' : ''}
            {delta} pts
          </span>
        )}
      </div>
      <p className={uiStyles.cardNote}>{trend.summary}</p>
    </div>
  );
}
