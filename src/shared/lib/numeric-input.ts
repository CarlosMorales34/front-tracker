// Deja escribir libremente (incluye vacío mientras se tipea) pero descarta
// cualquier caracter no numérico -- por eso los inputs que usan esto son
// type="text" con inputMode numérico en vez de type="number" (ese fuerza
// min/placeholder raros y no permite quedar en blanco entre un dígito y el
// siguiente). Compartido entre features (Entrenamientos, Progreso
// corporal) -- a diferencia de las clases CSS, que se duplican a propósito
// por archivo en este repo, esto es lógica pura sin fricción para compartir.
export function sanitizeInt(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeDecimal(value: string): string {
  const digitsAndDot = value.replace(/[^\d.]/g, '');
  const firstDot = digitsAndDot.indexOf('.');
  if (firstDot === -1) return digitsAndDot;
  return digitsAndDot.slice(0, firstDot + 1) + digitsAndDot.slice(firstDot + 1).replace(/\./g, '');
}
