import { BodyMeasurement } from '../types/body-progress.types';

interface TrendChartProps {
  measurements: BodyMeasurement[];
  targetWeightKg: number | null;
}

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Línea simple en SVG (sin librería, mismo criterio que WorkoutLineChart) --
// a diferencia de esa, acá el eje X se escala por fecha real (no por
// índice), porque las mediciones no caen en intervalos regulares.
export function TrendChart({ measurements, targetWeightKg }: TrendChartProps) {
  const points = measurements
    .filter((m): m is BodyMeasurement & { weightKg: number } => m.weightKg !== null)
    .map((m) => ({ date: new Date(m.measuredAt), weightKg: m.weightKg }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (points.length === 0) {
    return <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Sin mediciones en este período.</p>;
  }

  const values = points.map((p) => p.weightKg);
  const min = Math.min(...values, targetWeightKg ?? values[0]!);
  const max = Math.max(...values, targetWeightKg ?? values[0]!);
  const pad = Math.max((max - min) * 0.15, 0.5);
  const lo = min - pad;
  const hi = max + pad;
  const scaleY = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;

  const firstTime = points[0]!.date.getTime();
  const lastTime = points[points.length - 1]!.date.getTime();
  const span = lastTime - firstTime || 1;
  const scaleX = (t: number) => ((t - firstTime) / span) * 300;

  const svgPoints = points.map((p) => ({ x: scaleX(p.date.getTime()), y: scaleY(p.weightKg) }));
  const polylinePoints = svgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const goalLineY = targetWeightKg !== null ? scaleY(targetWeightKg) : null;

  const yTicks = [hi, (hi + lo) / 2, lo];
  const xTickIndices = points.length > 1 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : [0];

  return (
    <svg viewBox="-32 -8 344 130" style={{ width: '100%', height: 160, overflow: 'visible' }}>
      {yTicks.map((value, index) => (
        <g key={index}>
          <line x1={0} y1={scaleY(value)} x2={300} y2={scaleY(value)} stroke="var(--color-border)" strokeWidth={1} />
          <text x={-6} y={scaleY(value)} textAnchor="end" dominantBaseline="middle" fontSize={7} fill="var(--color-text-secondary)">
            {value.toFixed(0)} kg
          </text>
        </g>
      ))}

      {goalLineY !== null && (
        <>
          <line x1={0} y1={goalLineY} x2={300} y2={goalLineY} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={300} y={goalLineY - 4} textAnchor="end" fontSize={7} fill="var(--color-accent)">
            Meta {targetWeightKg!.toFixed(0)} kg
          </text>
        </>
      )}

      <polyline points={polylinePoints} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {svgPoints.map((p, index) => (
        <circle key={index} cx={p.x} cy={p.y} r={3} fill="var(--color-bg-elevated)" stroke="var(--color-accent)" strokeWidth={2} />
      ))}

      {xTickIndices.map((index) => (
        <text key={index} x={svgPoints[index]!.x} y={112} textAnchor="middle" fontSize={7} fill="var(--color-text-secondary)">
          {MONTH_LABELS[points[index]!.date.getMonth()]}
        </text>
      ))}
    </svg>
  );
}
