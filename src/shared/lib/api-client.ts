import { cacheGet, cacheSet } from './offline/response-cache';
import { enqueueMutation } from './offline/mutation-queue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Lanzada cuando una mutación (POST/PUT/PATCH/DELETE) no pudo llegar al
// servidor por falta de red y se encoló para reintentarse sola al
// reconectar (ver offline/mutation-queue.ts). Los call sites que quieran
// tratar esto como "guardado, pendiente de sincronizar" en vez de un error
// real pueden distinguirla con `error instanceof OfflineQueuedError`.
export class OfflineQueuedError extends Error {
  readonly queued = true as const;

  constructor() {
    super('Sin conexión: el cambio se guardó en este dispositivo y se sincronizará solo cuando vuelva la red.');
    this.name = 'OfflineQueuedError';
  }
}

// fetch() rechaza con un TypeError genérico ("Failed to fetch") cuando no
// hay red o el host no responde -- a diferencia de una respuesta HTTP de
// error (4xx/5xx), que sí llega como Response normal y ya se maneja aparte
// más abajo (!response.ok). Solo lo primero es "sin conexión".
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

async function parseBody<T>(response: Response): Promise<T> {
  // POST /api/auth/logout (y otros 204) responde sin body; response.json()
  // sobre un body vacío tira un SyntaxError, así que lo cortamos antes.
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const url = `${API_BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...init?.headers } as Record<string, string>;

  if (method === 'GET') {
    try {
      const response = await fetch(url, { ...init, headers });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(body.message ?? 'Request failed');
      }
      const data = await parseBody<T>(response);
      cacheSet(path, data);
      return data;
    } catch (error) {
      // Sin red: si hay una respuesta ya vista para este mismo path (con su
      // query string), se sirve esa en vez de romper la pantalla -- datos
      // viejos son mejor que ninguno mientras no hay conexión.
      if (isNetworkError(error)) {
        const cached = cacheGet<T>(path);
        if (cached !== null) return cached;
      }
      throw error;
    }
  }

  // Los endpoints de auth nunca se encolan: reintentar un login/refresh
  // viejo cuando vuelva la red no tiene sentido y debe fallar de inmediato
  // para que el usuario reintente a mano.
  const isAuthEndpoint = path.startsWith('/api/auth/');

  try {
    const response = await fetch(url, { ...init, headers });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(body.message ?? 'Request failed');
    }
    return await parseBody<T>(response);
  } catch (error) {
    if (!isAuthEndpoint && isNetworkError(error)) {
      enqueueMutation(url, method, init?.body as string | undefined, headers);
      throw new OfflineQueuedError();
    }
    throw error;
  }
}
