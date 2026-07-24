export function formatPercent(value: number | null): string {
  return value === null ? '0' : String(Math.round(value));
}

export function heatColor(percent: number | null): string {
  if (percent === null) return 'var(--color-border)';
  const alpha = Math.max(8, Math.round(percent));
  return `color-mix(in srgb, var(--color-accent) ${alpha}%, var(--color-border))`;
}
