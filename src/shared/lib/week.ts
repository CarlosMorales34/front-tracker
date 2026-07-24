// Convención de semana usada en toda la app: sábado a viernes (ver
// features/activities/utils/date-range.ts para el mismo criterio aplicado
// al selector de días). Semana 1 del año = la que contiene el primer
// sábado on/before el 1 de enero.

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getSaturdayWeekStart(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0=domingo … 6=sábado
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - daysSinceSaturday);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getCurrentWeekStartIso(): string {
  return toIso(getSaturdayWeekStart(new Date()));
}

export function addWeeks(dateIso: string, weeks: number): string {
  const date = new Date(dateIso);
  date.setDate(date.getDate() + weeks * 7);
  return toIso(date);
}

export function formatWeekRangeLabel(weekStartIso: string): string {
  const start = new Date(weekStartIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} – ${end.getDate()} ${MONTH_LABELS[end.getMonth()]}`;
}

export function getWeekNumberForYear(weekStartIso: string, year: number): number {
  const jan1 = new Date(year, 0, 1);
  const firstWeekStart = getSaturdayWeekStart(jan1);
  const target = new Date(weekStartIso);
  const diffDays = Math.round((target.getTime() - firstWeekStart.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

export function getWeekStartForWeekNumber(year: number, weekNumber: number): string {
  const jan1 = new Date(year, 0, 1);
  const firstWeekStart = getSaturdayWeekStart(jan1);
  const target = new Date(firstWeekStart);
  target.setDate(firstWeekStart.getDate() + (weekNumber - 1) * 7);
  return toIso(target);
}
