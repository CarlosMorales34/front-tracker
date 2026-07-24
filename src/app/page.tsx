import Link from 'next/link';
import { AppShell } from '../shared/components/layout/AppShell';

export default function HomePage() {
  return (
    <AppShell>
      <p>
        Empieza registrando tus métricas en <Link href="/metrics">/metrics</Link>.
      </p>
    </AppShell>
  );
}
