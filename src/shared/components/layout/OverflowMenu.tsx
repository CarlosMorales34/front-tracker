'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { LogoutButton } from '../../../features/auth/components/LogoutButton';
import { useTheme } from '../../theme/theme-context';
import { MoonIcon, SettingsIcon, SunIcon } from '../icons/icons';
import { useClickOutside } from '../../hooks/useClickOutside';
import { filterNavItemsByModules, NAV_ITEMS, splitNavItemsForMobile } from './nav-items';
import styles from './OverflowMenu.module.css';

interface OverflowMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Reemplaza los 2 íconos flotantes que tenía DashboardShell en mobile (tema
// + logout) por un único botón discreto de menú. Adentro: los destinos de
// NAV_ITEMS que ya no tienen acceso directo en la tab bar de 5 items
// (Analytics, Registro semanal, Gastos diarios), Ajustes (antes solo en el
// footer del Sidebar desktop, sin acceso en mobile) y las 2 acciones que
// vivían flotando (tema, cerrar sesión) -- nada se pierde, solo se agrupa.
export function OverflowMenu({ isOpen, onOpenChange }: OverflowMenuProps) {
  const pathname = usePathname();
  const { modules } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, isOpen, () => onOpenChange(false));

  const { overflowItems } = splitNavItemsForMobile(filterNavItemsByModules(NAV_ITEMS, modules));

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => onOpenChange(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </button>

      {isOpen && (
        <div className={styles.panel} role="menu" aria-label="Más opciones">
          {overflowItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={styles.item}
              role="menuitem"
              data-active={pathname === href}
              onClick={() => onOpenChange(false)}
            >
              <Icon width={17} height={17} />
              <span>{label}</span>
            </Link>
          ))}

          <Link
            href="/ajustes"
            className={styles.item}
            role="menuitem"
            data-active={pathname === '/ajustes'}
            onClick={() => onOpenChange(false)}
          >
            <SettingsIcon width={17} height={17} />
            <span>Ajustes</span>
          </Link>

          <div className={styles.divider} />

          <button type="button" className={styles.item} role="menuitem" onClick={toggleTheme}>
            {theme === 'dark' ? <SunIcon width={17} height={17} /> : <MoonIcon width={17} height={17} />}
            <span>{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}</span>
          </button>

          <LogoutButton variant="row" />
        </div>
      )}
    </div>
  );
}
