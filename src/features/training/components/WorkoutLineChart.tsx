interface WorkoutLineChartProps {
  values: number[];
}

// Línea simple en SVG (sin librería), mismo patrón que WeightTrendChart --
// pero con escala X genérica (N puntos) en vez de fija a 12 meses, para
// series de sesiones de entrenamiento de longitud variable.
export function WorkoutLineChart({ values }: WorkoutLineChartProps) {
  if (values.length === 0) {
    return <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Sin datos todavía.</p>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.1 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const scaleY = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const denom = values.length > 1 ? values.length - 1 : 1;

  const points = values.map((v, index) => ({ x: (index / denom) * 300, y: scaleY(v) }));
  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox="0 0 300 110" style={{ width: '100%', height: 120, overflow: 'visible' }}>
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
