// Autoguardado de formularios largos (ej. sesión de entrenamiento en vivo)
// en localStorage -- protege contra perder lo escrito si el usuario cierra
// o recarga la pestaña por accidente. Falla en silencio si localStorage no
// está disponible (modo privado, cuota llena): el autoguardado es una
// mejora, no debe romper el formulario.
const DRAFT_PREFIX = 'vitalis:draft:';

interface StoredDraft<T> {
  value: T;
  savedAt: number;
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    const payload: StoredDraft<T> = { value, savedAt: Date.now() };
    localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(payload));
  } catch {
    // no-op
  }
}

export function loadDraft<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    return raw ? (JSON.parse(raw) as StoredDraft<T>) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key);
  } catch {
    // no-op
  }
}
