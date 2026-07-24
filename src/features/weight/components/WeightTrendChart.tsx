import { WeightMonthEntry } from '../types/weight.types';

interface WeightTrendChartProps {
  months: WeightMonthEntry[];
  goalKg: number;
}

// Línea simple en SVG (sin librería) -- el eje Y se escala entre el min/max
// de los valores del año (más la meta) para que la línea siempre ocupe el
// espacio disponible, igual que el mockup.
export function WeightTrendChart({ months, goalKg }: WeightTrendChartProps) {
  const values = months.map((m) => m.value).filter((v): v is number => v !== null);
  const min = Math.min(goalKg, ...(values.length ? values : [goalKg]));
  const max = Math.max(goalKg, ...(values.length ? values : [goalKg]));
  const pad = 2;
  const lo = min - pad;
  const hi = max + pad;
  const scaleY = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const goalLineY = scaleY(goalKg);

  const points = months
    .map((m, index) => (m.value === null ? null : { x: (index / 11) * 300, y: scaleY(m.value) }))
    .filter((p): p is { x: number; y: number } => p !== null);

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox="0 0 300 110" style={{ width: '100%', height: 140, overflow: 'visible' }}>
      <line
        x1={0}
        y1={goalLineY}
        x2={300}
        y2={goalLineY}
        stroke="var(--color-border)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, index) => (
        <circle key={index} cx={p.x} cy={p.y} r={3} fill="var(--color-accent)" />
      ))}
    </svg>
  );
}
