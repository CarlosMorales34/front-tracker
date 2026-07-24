import { DayChip } from '../types/activities.types';

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTH_LABELS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
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

  const firstDate = new Date(first.dateIso);
  const lastDate = new Date(last.dateIso);

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
