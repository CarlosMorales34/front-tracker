// Unidad canónica de persistencia: kg (igual que el modelo anterior de
// Peso). Centralizado acá para que agregar soporte de lb más adelante sea
// un cambio en un solo lugar -- nada más en el feature debe formatear peso
// a mano.
export function formatWeightKg(value: number | null, fractionDigits = 1): string {
  return value === null ? '–' : value.toFixed(fractionDigits);
}

export function formatSignedKg(value: number | null, fractionDigits = 1): string {
  if (value === null) return '–';
  const rounded = Number(value.toFixed(fractionDigits));
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(fractionDigits)}`;
}
