import { apiFetch } from '../../../shared/lib/api-client';

export interface TrainingReadContext {
  userId: string;
  signal?: AbortSignal;
}

const TRAINING_TIMEOUT_MS = 8_000;

export function trainingFetch<T>(
  path: string,
  token?: string | null,
  init?: RequestInit,
  context?: TrainingReadContext,
): Promise<T> {
  const isCatalog = path.startsWith('/api/exercise-catalog');
  const isRead = !init?.method || init.method === 'GET';
  return apiFetch<T>(path, {
    ...init,
    signal: context?.signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }, {
    // Preserve the existing save path for workouts and routines. Aborting a
    // write after sending it can't establish whether the server committed it.
    timeoutMs: isRead || isCatalog ? TRAINING_TIMEOUT_MS : undefined,
    offlineCacheKey: context ? `training:${context.userId}:${path}` : undefined,
    // Canonical exercise changes need a current catalog and a confirmed server response.
    queueOffline: !isCatalog,
  });
}

export function trainingErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'El servidor tardó demasiado. Verifica si el cambio se guardó antes de reintentar.';
  }
  if (error instanceof TypeError) return fallback;
  return error instanceof Error ? error.message : fallback;
}
