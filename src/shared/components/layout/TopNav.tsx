'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../../theme/ThemeToggle';
import styles from './TopNav.module.css';

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.topNav}>
      <div className={styles.pills}>
        <Link href="/" className={pathname === '/' ? styles.pillActive : styles.pillInactive}>
          Home
        </Link>
        <Link href="/login" className={pathname === '/login' ? styles.pillActive : styles.pillInactive}>
          Login
        </Link>
      </div>
      <div className={styles.toggleWrap}>
        <ThemeToggle />
      </div>
    </nav>
  );
}
