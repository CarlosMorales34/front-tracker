const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// A propósito NO usa toISOString() (fuerza UTC) -- para un usuario en un
// timezone negativo (ej. México, UTC-6) con hora local avanzada, convertir a
// UTC puede saltar al día siguiente, desincronizando "hoy" del día de
// calendario local real (era la causa de que "hoy" apareciera un día atrás).
function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsea "YYYY-MM-DD" como medianoche LOCAL, no UTC.
function parseDateOnly(dateIso: string): Date {
  return new Date(`${dateIso}T00:00:00`);
}

export function getTodayIso(): string {
  return toIso(new Date());
}

export function addDays(dateIso: string, days: number): string {
  const date = parseDateOnly(dateIso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

export function formatDayLabel(dateIso: string): string {
  const date = parseDateOnly(dateIso);
  return `${WEEKDAY_LABELS[date.getDay()]} ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}
