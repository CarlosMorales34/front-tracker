import { ComponentType, SVGProps } from 'react';
import {
  CalendarCheckIcon,
  ChecklistIcon,
  CompassIcon,
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
  { href: '/analytics', label: 'Analytics', shortLabel: 'BI', icon: CompassIcon },
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

// Los 4 destinos que preferentemente tienen acceso directo en la barra
// inferior mobile (el 5to slot es el botón central de acción rápida, no un
// destino de navegación) -- todo lo demás en NAV_ITEMS se reubica en
// OverflowMenu. Sidebar (desktop) sigue mostrando la lista completa sin
// este recorte.
const BOTTOM_TAB_HREFS = ['/dashboard', '/actividades', '/finanzas', '/salud'];

// Si el usuario tiene un módulo desactivado (p.ej. sin Finanzas), ese slot
// preferente queda vacío -- en vez de dejar la barra con 3 iconos (lo que
// descentra el botón de acción rápida, ver BottomTabBar), se rellena en su
// misma posición con el siguiente item disponible de OverflowMenu para que
// siempre queden 2 iconos a cada lado del botón central.
export function splitNavItemsForMobile(items: NavItem[]): { bottomItems: NavItem[]; overflowItems: NavItem[] } {
  const byHref = new Map(items.map((item) => [item.href, item]));
  const extras = items.filter((item) => !BOTTOM_TAB_HREFS.includes(item.href));
  let nextExtraIndex = 0;

  const bottomItems = BOTTOM_TAB_HREFS.reduce<NavItem[]>((acc, href) => {
    const preferred = byHref.get(href);
    if (preferred) {
      acc.push(preferred);
    } else if (nextExtraIndex < extras.length) {
      acc.push(extras[nextExtraIndex]);
      nextExtraIndex += 1;
    }
    return acc;
  }, []);

  const usedHrefs = new Set(bottomItems.map((item) => item.href));
  return {
    bottomItems,
    overflowItems: items.filter((item) => !usedHrefs.has(item.href)),
  };
}
