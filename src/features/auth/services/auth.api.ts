import { apiFetch } from '../../../shared/lib/api-client';
import { AuthResponse, LoginInput, RefreshResponse, RegisterInput } from '../types/auth.types';

// Los endpoints de auth necesitan mandar/recibir la cookie httpOnly de
// refresh token entre orígenes (front en :3000, API en :4000), por eso
// siempre van con credentials:'include' -- a diferencia de metricsApi, que
// no depende de cookies y solo usa el Authorization header.
function withCredentials(init?: RequestInit): RequestInit {
  return { ...init, credentials: 'include' };
}

export const authApi = {
  register: (input: RegisterInput): Promise<AuthResponse> =>
    apiFetch<AuthResponse>(
      '/api/auth/register',
      withCredentials({ method: 'POST', body: JSON.stringify(input) })
    ),

  login: (input: LoginInput): Promise<AuthResponse> =>
    apiFetch<AuthResponse>(
      '/api/auth/login',
      withCredentials({ method: 'POST', body: JSON.stringify(input) })
    ),

  refresh: (): Promise<RefreshResponse> =>
    apiFetch<RefreshResponse>('/api/auth/refresh', withCredentials({ method: 'POST' })),

  logout: (): Promise<void> =>
    apiFetch<void>('/api/auth/logout', withCredentials({ method: 'POST' })),
};
