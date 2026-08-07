// Convención de semana usada en toda la app: sábado a viernes (ver
// features/activities/utils/date-range.ts para el mismo criterio aplicado
// al selector de días). Semana 1 del año = la que contiene el primer
// sábado on/before el 1 de enero.

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// 0=domingo..6=sábado, mismo índice que Date#getDay() -- usado por las
// rutinas de entrenamiento para asociarse (opcionalmente) a un día real y
// poder recomendarse cuando ese día llega.
export const WEEKDAY_FULL_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function getWeekdayOfDateIso(dateIso: string): number {
  return parseDateOnly(dateIso).getDay();
}

// A propósito NO usa toISOString() (fuerza UTC) -- para un usuario en un
// timezone negativo (ej. México, UTC-6) con hora local avanzada, convertir a
// UTC puede saltar al día siguiente, desincronizando el weekStartDate/dateIso
// que se manda al backend del día de calendario local real.
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

export function getTodayIso(): string {
  return toIso(new Date());
}

export interface WeekDayChip {
  dateIso: string;
  weekdayLabel: string;
  dayNumber: number;
}

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Los 7 días de la semana que empieza en `weekStartIso` (sábado), en vez de
// siempre "la semana actual" -- lo usan vistas con navegación de semana
// (Peso > Entrenamientos) donde el usuario puede estar viendo una semana
// distinta a la de hoy.
export function getWeekDayChips(weekStartIso: string): WeekDayChip[] {
  const start = parseDateOnly(weekStartIso);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      dateIso: toIso(date),
      weekdayLabel: WEEKDAY_LABELS[date.getDay()]!,
      dayNumber: date.getDate(),
    };
  });
}

export function addWeeks(dateIso: string, weeks: number): string {
  const date = parseDateOnly(dateIso);
  date.setDate(date.getDate() + weeks * 7);
  return toIso(date);
}

export function formatWeekRangeLabel(weekStartIso: string): string {
  const start = parseDateOnly(weekStartIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} – ${end.getDate()} ${MONTH_LABELS[end.getMonth()]}`;
}

export function getWeekNumberForYear(weekStartIso: string, year: number): number {
  const jan1 = new Date(year, 0, 1);
  const firstWeekStart = getSaturdayWeekStart(jan1);
  const target = parseDateOnly(weekStartIso);
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
