import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ThemeProvider } from '../shared/theme/theme-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'vitalis',
  description: 'Tu app personal de auto-seguimiento de métricas',
};

// Se ejecuta antes de la hidratación (strategy="beforeInteractive") para
// fijar data-theme en <html> según localStorage u override manual, y así
// evitar el flash de theme incorrecto (patrón estándar en Next.js App
// Router para esto, ya que no hay acceso a localStorage durante el SSR).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning es necesario acá porque el script inline de
    // abajo (THEME_INIT_SCRIPT) modifica el atributo data-theme de <html>
    // antes de que React hidrate, y el HTML generado en el servidor no lo
    // tiene (no hay acceso a localStorage durante SSR). Sin este flag React
    // reporta un hydration mismatch en consola aunque el comportamiento sea
    // correcto -- es el mismo patrón que usa next-themes.
    <html lang="es" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
