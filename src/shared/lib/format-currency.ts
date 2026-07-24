export function formatCurrency(amount: number, currency: 'MXN' | 'USD' = 'MXN'): string {
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}
