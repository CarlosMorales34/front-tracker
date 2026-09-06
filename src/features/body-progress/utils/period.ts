export type TrendPeriod = '1M' | '3M' | '1A';

export const TREND_PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1A', label: '1A' },
];

const PERIOD_DAYS: Record<TrendPeriod, number> = { '1M': 30, '3M': 90, '1A': 365 };

// Mismo criterio local-date-safe que shared/lib/week.ts (no toISOString,
// evita que un timezone negativo como México, UTC-6, retroceda un día).
function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function periodRange(period: TrendPeriod, todayIso: string): { from: string; to: string } {
  const today = new Date(`${todayIso}T00:00:00`);
  const from = new Date(today);
  from.setDate(from.getDate() - PERIOD_DAYS[period]);
  return { from: toIso(from), to: todayIso };
}
