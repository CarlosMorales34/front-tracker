import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <header>
        <h1>vitalis</h1>
        <p>Tu seguimiento personal de métricas.</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
