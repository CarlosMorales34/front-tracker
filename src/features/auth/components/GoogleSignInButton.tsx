'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleCredentialResponse {
  credential: string;
}

// Tipado mínimo de lo que usamos de la librería global de Google Identity
// Services -- no hay @types oficiales para esta API basada en script tag.
interface GoogleAccountsId {
  initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let gisScriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (gisScriptPromise) return gisScriptPromise;
  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisScriptPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
}

// Renderiza el botón oficial de Google (Identity Services) -- a diferencia
// de los otros botones "Continuar con X" de este form, este no puede ser un
// <button> propio disparando un handler: Google exige que el botón visible
// sea el suyo para el flujo de ID token. Se ajusta con theme/shape para que
// combine razonablemente con el tema oscuro de la app.
export function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientId] = useState(() => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '');

  useEffect(() => {
    if (!clientId) {
      onError?.('Google Sign-In no está configurado (falta NEXT_PUBLIC_GOOGLE_CLIENT_ID).');
      return;
    }

    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: containerRef.current.offsetWidth || 320,
        });
      })
      .catch((error: Error) => onError?.(error.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
}
