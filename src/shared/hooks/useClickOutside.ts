import { RefObject, useEffect } from 'react';

// Usado por los popovers de navegación (QuickActionButton, OverflowMenu)
// para cerrarse al tocar fuera o presionar Escape -- centralizado acá para
// no duplicar la misma lógica de listeners en cada uno.
export function useClickOutside(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void): void {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOutside();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, ref, onOutside]);
}
