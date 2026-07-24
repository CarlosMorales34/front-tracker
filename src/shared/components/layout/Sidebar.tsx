'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompassIcon, SettingsIcon } from '../icons/icons';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { NAV_ITEMS } from './nav-items';
import styles from './Sidebar.module.css';

// Navegación desktop (≥ md, ver Sidebar.module.css). En mobile no se
// renderiza — BottomTabBar cubre ese caso, ver DashboardShell.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <CompassIcon width={22} height={22} />
        </div>
        <span className={styles.brandName}>Bienestar Integral</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className={styles.navItem} data-active={isActive}>
              <Icon width={19} height={19} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/ajustes" className={styles.navItem} data-active={pathname === '/ajustes'}>
          <SettingsIcon width={19} height={19} />
          <span>Ajustes</span>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
