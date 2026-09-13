'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBarIcon, TrendUpIcon, WalletIcon } from '../../../shared/components/icons/icons';
import styles from '../../../shared/components/layout/HealthTabs.module.css';

const TABS = [
  { href: '/finanzas', label: 'Resumen', icon: ChartBarIcon },
  { href: '/finanzas/ingresos', label: 'Ingresos', icon: TrendUpIcon },
  { href: '/finanzas/patrimonio', label: 'Patrimonio', icon: WalletIcon },
];

// Navegación real (rutas, no estado local) entre las 3 secciones de
// Finanzas -- mismo criterio que HealthTabs (deep-linking, back button,
// refresh funcionan porque cada pestaña es su propia ruta). Reusa el CSS de
// HealthTabs.module.css tal cual, es el mismo componente visual.
export function FinanceTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabToggle} data-tour="finanzas-toggle">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} data-selected={pathname === tab.href}>
          <tab.icon width={13} height={13} /> {tab.label}
        </Link>
      ))}
    </nav>
  );
}
