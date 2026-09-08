'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { PlusIcon } from '../icons/icons';
import { useClickOutside } from '../../hooks/useClickOutside';
import { filterQuickActionsByModules, QUICK_ACTIONS } from './quick-actions';
import styles from './QuickActionButton.module.css';

interface QuickActionButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Botón "+" central de la tab bar mobile -- acceso rápido a las 4 acciones
// de creación/registro que ya existen en la app (ver quick-actions.ts).
// Solo navegación de acceso rápido, sin opciones de configuración.
export function QuickActionButton({ isOpen, onOpenChange }: QuickActionButtonProps) {
  const { modules } = useAuth();
  const actions = filterQuickActionsByModules(QUICK_ACTIONS, modules);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, isOpen, () => onOpenChange(false));

  return (
    <div className={styles.container} ref={containerRef}>
      {isOpen && (
        <div className={styles.panel} role="menu" aria-label="Acciones rápidas">
          {actions.map((action) => (
            <Link
              key={action.key}
              href={action.href}
              className={styles.option}
              role="menuitem"
              onClick={() => onOpenChange(false)}
            >
              <span className={styles.optionIcon}>
                <action.icon width={18} height={18} />
              </span>
              <span>
                <span className={styles.optionLabel}>{action.label}</span>
                <span className={styles.optionDescription}>{action.description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        className={styles.fab}
        onClick={() => onOpenChange(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú de acciones rápidas' : 'Abrir menú de acciones rápidas'}
      >
        <span className={styles.fabIcon} data-open={isOpen}>
          <PlusIcon width={22} height={22} />
        </span>
      </button>
    </div>
  );
}
