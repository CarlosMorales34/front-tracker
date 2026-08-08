'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '../components/icons/icons';
import { useTheme } from './theme-context';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // El theme "real" del cliente solo se conoce después de montar (ver
  // getInitialTheme en theme-context.tsx, que lee el DOM). Si renderizamos
  // el ícono sol/luna en el primer render usando ese valor, puede no
  // coincidir con el HTML generado en el servidor y React tira un warning
  // de hydration mismatch. Por eso mostramos un placeholder neutro hasta
  // que el componente está montado en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mismo problema aplica al aria-label (también depende de `theme`): lo
  // dejamos neutro hasta montar para que coincida con el render del server.
  const label = mounted ? (theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') : 'Cambiar tema';

  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme} aria-label={label}>
      {mounted ? (
        <span key={theme} className={styles.iconCrossfade}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </span>
      ) : (
        <span className={styles.placeholder} />
      )}
    </button>
  );
}
