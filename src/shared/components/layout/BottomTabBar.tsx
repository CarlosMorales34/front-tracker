'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';
import styles from './BottomTabBar.module.css';

// Navegación mobile (< md, ver Sidebar.module.css para el breakpoint
// espejo). El toggle de tema no vive acá (la barra ya está justa con 6
// íconos, igual que en el mockup) — se muestra flotante en DashboardShell.
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabBar} data-tour-scope="mobile-nav">
      {NAV_ITEMS.map(({ href, shortLabel, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={styles.tab} data-active={isActive} data-tour={`nav-${href}`}>
            <Icon width={20} height={20} />
            <span>{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
