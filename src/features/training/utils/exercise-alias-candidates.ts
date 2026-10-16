const families = [
  ['martillo', 'martillos', 'curl martillo'],
  ['pantorrilla', 'pantorrillas'],
  ['lagartija', 'lagartijas', 'flexion', 'flexiones'],
];

export function exerciseAliasFamily(name: string): string | null {
  const key = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  return families.find(family => family.includes(key))?.[0] ?? null;
}
