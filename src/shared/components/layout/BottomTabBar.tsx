'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { QuickActionButton } from './QuickActionButton';
import { filterNavItemsByModules, NAV_ITEMS, splitNavItemsForMobile } from './nav-items';
import styles from './BottomTabBar.module.css';

interface BottomTabBarProps {
  isQuickActionOpen: boolean;
  onQuickActionOpenChange: (open: boolean) => void;
}

// Navegación mobile (< md, ver Sidebar.module.css para el breakpoint
// espejo). 5 slots: Inicio, Actividades, botón central de acción rápida,
// Finanzas, Salud -- el resto de NAV_ITEMS (Analytics, Registro semanal,
// Gastos diarios) se reubicó en OverflowMenu, ver nav-items.ts.
export function BottomTabBar({ isQuickActionOpen, onQuickActionOpenChange }: BottomTabBarProps) {
  const pathname = usePathname();
  const { modules } = useAuth();
  const { bottomItems } = splitNavItemsForMobile(filterNavItemsByModules(NAV_ITEMS, modules));
  const midpoint = Math.ceil(bottomItems.length / 2);

  const renderTab = ({ href, shortLabel, icon: Icon }: (typeof bottomItems)[number]) => {
    const isActive = pathname === href;
    return (
      <Link key={href} href={href} className={styles.tab} data-active={isActive} data-tour={`nav-${href}`}>
        <Icon width={20} height={20} />
        <span>{shortLabel}</span>
      </Link>
    );
  };

  return (
    <nav className={styles.tabBar} data-tour-scope="mobile-nav">
      {bottomItems.slice(0, midpoint).map(renderTab)}
      <QuickActionButton isOpen={isQuickActionOpen} onOpenChange={onQuickActionOpenChange} />
      {bottomItems.slice(midpoint).map(renderTab)}
    </nav>
  );
}
