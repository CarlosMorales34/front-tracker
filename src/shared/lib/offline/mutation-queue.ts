// Cola de escrituras (POST/PUT/PATCH/DELETE) que fallaron por falta de red,
// persistida en localStorage para sobrevivir un reload. Se reintenta en
// orden (FIFO) al reconectar -- ver api-client.ts para dónde se encola y
// OfflineIndicator.tsx para dónde se muestra/dispara el flush.
const QUEUE_KEY = 'vitalis:mutation-queue';

export interface QueuedMutation {
  id: string;
  url: string;
  method: string;
  body: string | undefined;
  headers: Record<string, string>;
  createdAt: number;
}

function readQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // no-op -- si no se puede persistir la cola, tampoco se puede encolar,
    // pero eso ya se manejó como excepción normal en apiFetch.
  }
}

// Pub/sub minimalista para que OfflineIndicator se refresque cuando la cola
// cambia, sin depender de un state manager global.
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyQueueChange(): void {
  listeners.forEach((listener) => listener());
}

export function enqueueMutation(
  url: string,
  method: string,
  body: string | undefined,
  headers: Record<string, string>,
): void {
  const mutation: QueuedMutation = { id: crypto.randomUUID(), url, method, body, headers, createdAt: Date.now() };
  const queue = readQueue();
  queue.push(mutation);
  writeQueue(queue);
  notifyQueueChange();
}

export function getQueueLength(): number {
  return readQueue().length;
}

function removeFromQueue(id: string): void {
  writeQueue(readQueue().filter((mutation) => mutation.id !== id));
  notifyQueueChange();
}

let isFlushing = false;

// Reintenta las mutaciones encoladas en orden y se detiene en el primer
// fallo de red (probablemente sigue sin conexión) para no reordenar
// escrituras contra el servidor. Si el servidor SÍ responde pero rechaza la
// mutación (4xx/5xx -- no es un problema de red), se saca de la cola: no
// hay forma segura de "arreglarla" sola reintentándola en loop.
export async function flushQueue(): Promise<void> {
  if (isFlushing || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  isFlushing = true;
  try {
    for (const mutation of readQueue()) {
      try {
        // Se recibió respuesta del servidor (éxito o rechazo) -- en ambos
        // casos ya no es un problema de red, así que sale de la cola.
        await fetch(mutation.url, {
          method: mutation.method,
          body: mutation.body,
          headers: mutation.headers,
          credentials: 'include',
        });
        removeFromQueue(mutation.id);
      } catch {
        break;
      }
    }
  } finally {
    isFlushing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushQueue());
}
