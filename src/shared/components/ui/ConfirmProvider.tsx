'use client';

import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal } from './Modal';
import uiStyles from './ui.module.css';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

// Confirmación consistente para toda acción destructiva de la app (borrar
// categoría, actividad, rutina, gasto, ingreso, tarjeta, contador,
// entrenamiento...) -- reemplaza window.confirm() (que rompe con el look de
// la app y bloquea automatización/tests) por un modal propio. Devuelve una
// promesa en vez de un callback para que el caller pueda simplemente hacer
// `if (await confirm(...)) { ...borrar... }` sin manejar estado local.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    const normalized = typeof opts === 'string' ? { message: opts } : opts;
    setOptions(normalized);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = (result: boolean) => {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal title={options.title ?? 'Confirmar'} onClose={() => settle(false)}>
          <p className={uiStyles.cardNote} style={{ marginBottom: '1.25rem' }}>
            {options.message}
          </p>
          <div className={uiStyles.modalActions}>
            <button type="button" className={uiStyles.modalCancelButton} onClick={() => settle(false)}>
              {options.cancelLabel ?? 'Cancelar'}
            </button>
            <button type="button" className={uiStyles.modalDangerButton} onClick={() => settle(true)} autoFocus>
              {options.confirmLabel ?? 'Sí, borrar'}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}
