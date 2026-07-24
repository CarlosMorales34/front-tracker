export function formatKg(value: number | null): string {
  return value === null ? '–' : value.toFixed(1).replace(/\.0$/, '');
}

export function formatDelta(value: number | null): string {
  if (value === null) return '–';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatKg(value)}`;
}
