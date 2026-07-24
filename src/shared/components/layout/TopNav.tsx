import { ThemeToggle } from '../../theme/ThemeToggle';
import styles from './TopNav.module.css';

// Barra superior de las pantallas pre-login (home, login, register,
// forgot-password). Antes tenía una cápsula Home/Login -- se quitó porque
// por ahora el único flujo real es login, la cápsula no aportaba nada.
export function TopNav() {
  return (
    <nav className={styles.topNav}>
      <ThemeToggle />
    </nav>
  );
}
