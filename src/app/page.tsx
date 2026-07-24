import Link from 'next/link';
import { TopNav } from '../shared/components/layout/TopNav';
import { AppShell } from '../shared/components/layout/AppShell';

export default function HomePage() {
  return (
    <>
      <TopNav />
      <AppShell>
        <p>
          Empieza registrando tus métricas en <Link href="/metrics">/metrics</Link>.
        </p>
      </AppShell>
    </>
  );
}
