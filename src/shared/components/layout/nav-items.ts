import { ComponentType, SVGProps } from 'react';
import {
  CalendarCheckIcon,
  ChecklistIcon,
  HomeIcon,
  ReceiptIcon,
  ScaleIcon,
  WalletIcon,
} from '../icons/icons';

export type NavDomain = 'activities' | 'finance' | 'health';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  // undefined = siempre visible (Inicio) -- el resto se filtra según
  // UserModules (ver AuthContext) para que el usuario solo vea los
  // dominios que eligió tener habilitados.
  domain?: NavDomain;
}

// Única fuente de verdad para la navegación post-login: Sidebar (desktop) y
// BottomTabBar (mobile) leen de aquí para no duplicar la lista. `shortLabel`
// es el texto que usa la tab bar mobile (más angosta que el sidebar).
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', shortLabel: 'Inicio', icon: HomeIcon },
  { href: '/actividades', label: 'Actividades diarias', shortLabel: 'Actividades', icon: ChecklistIcon, domain: 'activities' },
  { href: '/semanal', label: 'Registro semanal', shortLabel: 'Semanal', icon: CalendarCheckIcon, domain: 'activities' },
  { href: '/finanzas', label: 'Finanzas sem/quincenal', shortLabel: 'Finanzas', icon: WalletIcon, domain: 'finance' },
  { href: '/gastos', label: 'Gastos diarios', shortLabel: 'Gastos', icon: ReceiptIcon, domain: 'finance' },
  { href: '/salud', label: 'Salud', shortLabel: 'Salud', icon: ScaleIcon, domain: 'health' },
];

export function filterNavItemsByModules(
  items: NavItem[],
  modules: { hasActivities: boolean; hasFinance: boolean; hasHealth: boolean } | null,
): NavItem[] {
  // null = todavía cargando los módulos del usuario -- se muestra todo para
  // no parpadear items que un instante después sí van a estar habilitados.
  if (!modules) return items;
  return items.filter((item) => {
    if (!item.domain) return true;
    if (item.domain === 'activities') return modules.hasActivities;
    if (item.domain === 'finance') return modules.hasFinance;
    return modules.hasHealth;
  });
}
