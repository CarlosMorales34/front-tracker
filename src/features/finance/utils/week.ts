// Numeración de semana basada en una fecha ancla configurable por el usuario
// (Finanzas > Semana 1) -- separada del cómputo sábado-a-viernes que usa el
// resto de la app (shared/lib/week.ts), a propósito: solo afecta la
// etiqueta "Sem N" que se muestra acá.
export function getWeekNumberFromAnchor(weekStartIso: string, anchorIso: string): number {
  const anchor = new Date(anchorIso);
  const target = new Date(weekStartIso);
  const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}
