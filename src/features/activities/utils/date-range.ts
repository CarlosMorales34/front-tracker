import { DayChip } from '../types/activities.types';

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTH_LABELS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

// A propósito NO usa toISOString() (fuerza UTC) -- para un usuario en un
// timezone negativo (ej. México, UTC-6) con hora local avanzada, convertir a
// UTC puede saltar al día siguiente, desincronizando el dateIso usado para
// comparar contra activity_logs.log_date del día del calendario LOCAL que
// muestran weekdayLabel/dayNumber (esos sí ya usan métodos locales).
function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsea "YYYY-MM-DD" como medianoche LOCAL, no UTC -- new Date(isoString)
// con un string de solo fecha lo trataría como UTC medianoche, que en un
// timezone negativo retrocede al día de calendario anterior.
function parseDateOnly(dateIso: string): Date {
  return new Date(`${dateIso}T00:00:00`);
}

// La semana visible arranca en sábado (mismo criterio que el diseño:
// "Sáb 8 – Vie 14"). Calculado desde la fecha real de hoy, no fijo.
export function getCurrentWeekDayChips(today: Date = new Date()): DayChip[] {
  const dayOfWeek = today.getDay(); // 0=domingo … 6=sábado
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() - daysSinceSaturday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday);
    date.setDate(saturday.getDate() + index);
    return {
      dateIso: toIso(date),
      weekdayLabel: WEEKDAY_LABELS[date.getDay()],
      dayNumber: date.getDate(),
    };
  });
}

export function formatDateRangeLabel(days: DayChip[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';

  const firstDate = parseDateOnly(first.dateIso);
  const lastDate = parseDateOnly(last.dateIso);

  const firstLabel = `${first.weekdayLabel[0]}${first.weekdayLabel.slice(1).toLowerCase()} ${first.dayNumber}`;
  const lastLabel = `${last.weekdayLabel[0]}${last.weekdayLabel.slice(1).toLowerCase()} ${last.dayNumber} ${MONTH_LABELS[lastDate.getMonth()]}`;

  if (firstDate.getMonth() === lastDate.getMonth()) {
    return `${firstLabel} – ${lastLabel}`;
  }
  return `${firstLabel} ${MONTH_LABELS[firstDate.getMonth()]} – ${lastLabel}`;
}

export function getTodayIso(): string {
  return toIso(new Date());
}

export function addDaysIso(dateIso: string, days: number): string {
  const date = parseDateOnly(dateIso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

// Rango [primer día, último día] del mes que contiene `dateIso`.
export function getMonthRange(dateIso: string): { from: string; to: string } {
  const date = parseDateOnly(dateIso);
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toIso(from), to: toIso(to) };
}

export function getPreviousMonthRange(dateIso: string): { from: string; to: string } {
  const date = parseDateOnly(dateIso);
  const previousMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthRange(toIso(previousMonthDate));
}
