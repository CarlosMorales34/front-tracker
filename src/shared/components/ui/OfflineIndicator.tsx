'use client';

import { useEffect, useState } from 'react';
import { flushQueue, getQueueLength, subscribeQueue } from '../../lib/offline/mutation-queue';
import styles from './ui.module.css';

// Banner global: cambios que no pudieron llegar al servidor (sin red) y
// quedaron encolados localmente (ver shared/lib/offline/mutation-queue.ts).
// Se re-renderiza solo cuando la cola cambia (pub/sub, sin polling) y
// dispara un intento de sincronizar apenas monta -- cubre el caso de abrir
// la app ya conectado con pendientes de una sesión offline anterior.
export function OfflineIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getQueueLength());
    const unsubscribe = subscribeQueue(() => setCount(getQueueLength()));
    void flushQueue();
    return unsubscribe;
  }, []);

  if (count === 0) return null;

  return (
    <div className={styles.offlineBanner} role="status">
      {count === 1 ? '1 cambio pendiente de sincronizar' : `${count} cambios pendientes de sincronizar`}
    </div>
  );
}
