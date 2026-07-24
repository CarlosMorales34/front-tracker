import { WeightGoalDirection, WeightYearExtreme } from '../types/weight.types';
import { formatKg } from '../utils/format';

const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface WeightExtremesChartProps {
  extremes: WeightYearExtreme[];
  goalDirection: WeightGoalDirection;
}

// Un renglón horizontal por año: un punto en el peso "mejor" (según
// goalDirection) y otro en el "peor", unidos por una línea -- el largo del
// segmento muestra qué tanto varió ese año, no solo los extremos sueltos.
// Escala compartida entre todos los años para poder comparar de un vistazo.
export function WeightExtremesChart({ extremes, goalDirection }: WeightExtremesChartProps) {
  if (extremes.length === 0) {
    return null;
  }

  const allValues = extremes.flatMap((e) => [e.bestValue, e.worstValue]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const pad = Math.max(1, (max - min) * 0.15);
  const lo = min - pad;
  const hi = max + pad;
  const scaleX = (v: number) => ((v - lo) / (hi - lo || 1)) * 100;

  const rowHeight = 46;
  const height = extremes.length * rowHeight;
  const bestLabel = goalDirection === 'gain' ? 'más alto' : 'más bajo';
  const worstLabel = goalDirection === 'gain' ? 'más bajo' : 'más alto';

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-accent)', display: 'inline-block' }} />
          Mejor ({bestLabel})
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-text-secondary)', display: 'inline-block' }} />
          Peor ({worstLabel})
        </span>
      </div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        {extremes.map((extreme, index) => {
          const y = index * rowHeight + rowHeight / 2;
          const bestX = scaleX(extreme.bestValue);
          const worstX = scaleX(extreme.worstValue);
          return (
            <g key={extreme.year}>
              <line x1={worstX} y1={y} x2={bestX} y2={y} stroke="var(--color-border)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
              <circle cx={worstX} cy={y} r={1.4} fill="var(--color-text-secondary)" />
              <circle cx={bestX} cy={y} r={1.4} fill="var(--color-accent)" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
        {extremes.map((extreme) => (
          <div
            key={extreme.year}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}
          >
            <span style={{ width: 34, flexShrink: 0, fontWeight: 700, color: 'var(--color-text)' }}>{extreme.year}</span>
            <span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                {MONTH_ABBR[extreme.bestMonth - 1]} {formatKg(extreme.bestValue)}kg
              </span>
              {' · '}
              {MONTH_ABBR[extreme.worstMonth - 1]} {formatKg(extreme.worstValue)}kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
