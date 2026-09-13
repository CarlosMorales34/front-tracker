import { getTodayIso } from '../../../shared/lib/week';
import { MoneyEntryRecurrence } from '../types/finance.types';

// Mismo criterio local-date-safe que shared/lib/week.ts -- parsea "YYYY-MM-DD"
// como medianoche LOCAL, nunca UTC. Self-contained a propósito (no mezcla
// con addDaysUTC de shared/lib/week.ts) para no combinar dos convenciones de
// fecha distintas en el mismo cálculo.
function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Suma `months` ajustando al último día del mes destino si el día original
// no existe ahí (ej. 31 de enero + 1 mes = 28/29 de febrero) -- mismo
// criterio que el equivalente en el backend (shared/utils/recurrence.ts).
function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfTargetMonth));
}

// Mismo cálculo que backend/shared/utils/recurrence.ts -- puramente
// informativo (no genera filas nuevas), null para 'unique'.
export function nextOccurrence(originalDateIso: string, recurrence: MoneyEntryRecurrence): string | null {
  if (recurrence === 'unique') return null;

  const today = parseDateOnly(getTodayIso());
  let next = parseDateOnly(originalDateIso);

  if (recurrence === 'weekly' || recurrence === 'biweekly') {
    const periodDays = recurrence === 'weekly' ? 7 : 14;
    while (next.getTime() <= today.getTime()) next = addDays(next, periodDays);
  } else {
    const periodMonths = recurrence === 'monthly' ? 1 : 12;
    while (next.getTime() <= today.getTime()) next = addMonths(next, periodMonths);
  }

  return formatDateOnly(next);
}
