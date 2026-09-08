'use client';

import { ReactNode, useState } from 'react';
import { OfflineIndicator } from '../ui/OfflineIndicator';
import { BottomTabBar } from './BottomTabBar';
import { OverflowMenu } from './OverflowMenu';
import { Sidebar } from './Sidebar';
import styles from './DashboardShell.module.css';

type OpenMenu = 'quickAction' | 'overflow' | null;

// Shell de la app post-login: Sidebar a la izquierda en desktop
// (≥900px, ver Sidebar.module.css), BottomTabBar fija abajo en mobile
// (mismo breakpoint espejo en BottomTabBar.module.css) con su botón central
// de acción rápida, y OverflowMenu flotando arriba a la derecha en mobile
// (reemplaza los botones de tema/logout que antes flotaban ahí sueltos --
// ahora viven dentro del menú, junto con los destinos de nav que se
// reubicaron desde la tab bar). `openMenu` se comparte entre ambos para que
// nunca estén abiertos los dos a la vez.
export function DashboardShell({ children }: { children: ReactNode }) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.mobileFloatingActions}>
        <OverflowMenu
          isOpen={openMenu === 'overflow'}
          onOpenChange={(open) => setOpenMenu(open ? 'overflow' : null)}
        />
      </div>
      <main className={styles.content}>
        <OfflineIndicator />
        {children}
      </main>
      <BottomTabBar
        isQuickActionOpen={openMenu === 'quickAction'}
        onQuickActionOpenChange={(open) => setOpenMenu(open ? 'quickAction' : null)}
      />
    </div>
  );
}
