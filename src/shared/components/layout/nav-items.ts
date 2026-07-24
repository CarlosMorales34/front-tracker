import { ComponentType, SVGProps } from 'react';
import {
  CalendarCheckIcon,
  ChecklistIcon,
  HomeIcon,
  ReceiptIcon,
  ScaleIcon,
  WalletIcon,
} from '../icons/icons';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Única fuente de verdad para la navegación post-login: Sidebar (desktop) y
// BottomTabBar (mobile) leen de aquí para no duplicar la lista. `shortLabel`
// es el texto que usa la tab bar mobile (más angosta que el sidebar).
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', shortLabel: 'Inicio', icon: HomeIcon },
  { href: '/actividades', label: 'Actividades diarias', shortLabel: 'Actividades', icon: ChecklistIcon },
  { href: '/semanal', label: 'Registro semanal', shortLabel: 'Semanal', icon: CalendarCheckIcon },
  { href: '/finanzas', label: 'Finanzas sem/quincenal', shortLabel: 'Finanzas', icon: WalletIcon },
  { href: '/gastos', label: 'Gastos diarios', shortLabel: 'Gastos', icon: ReceiptIcon },
  { href: '/peso', label: 'Peso mensual', shortLabel: 'Peso', icon: ScaleIcon },
];
