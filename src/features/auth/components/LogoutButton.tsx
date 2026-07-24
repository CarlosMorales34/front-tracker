'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoutIcon } from '../../../shared/components/icons/icons';
import { useAuth } from '../context/AuthContext';
import styles from './LogoutButton.module.css';

interface LogoutButtonProps {
  variant?: 'row' | 'icon';
}

// variant="row": fila con label "Cerrar sesión", usada en el Sidebar
// desktop. variant="icon": botón circular solo con ícono, mismo tamaño que
// ThemeToggle -- usado como flotante en mobile (DashboardShell).
export function LogoutButton({ variant = 'row' }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={styles.iconButton}
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label="Cerrar sesión"
      >
        <LogoutIcon width={17} height={17} />
      </button>
    );
  }

  return (
    <button type="button" className={styles.rowButton} onClick={handleLogout} disabled={isLoggingOut}>
      <LogoutIcon />
      <span>{isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
    </button>
  );
}
