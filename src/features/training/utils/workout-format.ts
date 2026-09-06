const MONTH_ABBR_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Parseo local explícito (no bare `new Date(iso)`) -- mismo patrón de fix de
// timezone usado en el resto de la app esta sesión.
export function parseDateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function formatDayLabel(iso: string): string {
  const date = parseDateOnly(iso);
  return `${date.getDate()} ${MONTH_ABBR_ES[date.getMonth()]}`;
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDurationLabel(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

export function formatRepsLabel(weight: number | null, reps: number[]): string {
  const weightPart = weight !== null ? `${weight} lbs × ` : '';
  return `${weightPart}${reps.join('/')} reps`;
}
