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
