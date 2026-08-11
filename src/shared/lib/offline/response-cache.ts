// Caché de la última respuesta exitosa de cada GET, para poder mostrar
// datos ya vistos si la red falla (ver api-client.ts). No es una caché con
// invalidación/expiración -- simplemente el último dato bueno conocido, se
// sobreescribe en cada GET exitoso.
const CACHE_PREFIX = 'vitalis:cache:';

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage lleno o no disponible (modo privado) -- la caché es una
    // mejora, no debe romper la app si falla.
  }
}
