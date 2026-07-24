import { ReactNode } from 'react';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';
import styles from './DashboardShell.module.css';

// Shell de la app post-login: Sidebar a la izquierda en desktop
// (≥900px, ver Sidebar.module.css), BottomTabBar fija abajo en mobile
// (mismo breakpoint espejo en BottomTabBar.module.css). El toggle de tema
// vive dentro del Sidebar en desktop; en mobile no hay lugar en la tab bar
// (ya va justa con 6 íconos, igual que el mockup), así que se muestra acá
// como botón flotante — solo visible en mobile vía CSS.
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.mobileThemeToggle}>
        <ThemeToggle />
      </div>
      <main className={styles.content}>{children}</main>
      <BottomTabBar />
    </div>
  );
}
