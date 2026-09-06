'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardShell } from '../../shared/components/layout/DashboardShell';
import { Spinner } from '../../shared/components/ui/Spinner';

// "Peso" se convirtió en "Salud" (Progreso corporal + Entrenamientos, ver
// /salud/progreso y /salud/entrenamientos) -- esta ruta se conserva como
// redirect en vez de borrarse, por si queda algún bookmark o link viejo
// apuntando acá.
export default function PesoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/salud/progreso');
  }, [router]);

  return (
    <DashboardShell>
      <Spinner />
    </DashboardShell>
  );
}
