export function formatHours(value: number | null | undefined): string {
  return value === null || value === undefined ? '–' : String(value);
}

export function sumHours(values: (number | null)[]): number | null {
  const total = values.reduce<number | null>((acc, value) => {
    if (value === null) return acc;
    return (acc ?? 0) + value;
  }, null);
  return total;
}

// Diferencia entre dos horas "HH:MM", en horas decimales redondeadas a 2
// dígitos. `overnight` trata un end <= start como que cruzó medianoche (ej.
// Dormir: acostarse 23:00, despertar 07:00) en vez de un rango inválido.
export function computeDurationHours(start: string, end: string, overnight = false): number | null {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if ([startH, startM, endH, endM].some((n) => n === undefined || Number.isNaN(n))) return null;

  const startMinutes = startH! * 60 + startM!;
  let endMinutes = endH! * 60 + endM!;
  if (endMinutes <= startMinutes) {
    if (!overnight) return null;
    endMinutes += 24 * 60;
  }

  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
}
