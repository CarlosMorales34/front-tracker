'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/auth.api';
import { LoginInput, RegisterInput, User } from '../types/auth.types';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// NOTA DE DISEÑO: el contrato de POST /api/auth/refresh solo devuelve
// { accessToken }, sin el objeto user (a diferencia de login/register). Para
// poder recuperar sesión silenciosamente y saber "quién" es el usuario sin
// otra llamada, decodificamos el payload del JWT del accessToken de forma
// best-effort. Si el token no es un JWT o no trae id/email, tratamos la
// sesión como no recuperada (user = null) en vez de asumir datos. Esto es
// una decisión mía porque el contrato fijo no deja otra opción del lado del
// front -- si el backend termina exponiendo un /api/auth/me o incluye el
// user en el refresh, esto se puede simplificar.
function decodeUserFromAccessToken(token: string): User | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized));
    if (typeof json.id === 'string' && typeof json.email === 'string') {
      return { id: json.id, email: json.email, name: typeof json.name === 'string' ? json.name : '' };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authApi
      .refresh()
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.accessToken);
        setUser(decodeUserFromAccessToken(res.accessToken));
      })
      .catch(() => {
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await authApi.login(input);
    setUser(res.user);
    setAccessToken(res.accessToken);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await authApi.google(idToken);
    setUser(res.user);
    setAccessToken(res.accessToken);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await authApi.register(input);
    setUser(res.user);
    setAccessToken(res.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, isLoading, login, loginWithGoogle, register, logout }),
    [user, accessToken, isLoading, login, loginWithGoogle, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
