'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarbellIcon, ScaleIcon } from '../icons/icons';
import styles from './HealthTabs.module.css';

const TABS = [
  { href: '/salud/progreso', label: 'Progreso', icon: ScaleIcon },
  { href: '/salud/entrenamientos', label: 'Entrenamientos', icon: BarbellIcon },
];

// Navegación real (rutas, no estado local) entre los subdominios de Salud
// -- a diferencia del toggle que reemplaza (WeightView.tsx tenía un
// useState alternando la vista), esto sí soporta deep-linking, back button
// y refresh, porque cada pestaña es su propia ruta (/salud/progreso,
// /salud/entrenamientos).
export function HealthTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabToggle} data-tour="salud-toggle">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} data-selected={pathname === tab.href}>
          <tab.icon width={13} height={13} /> {tab.label}
        </Link>
      ))}
    </nav>
  );
}
