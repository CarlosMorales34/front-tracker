import { apiFetch } from '../../../shared/lib/api-client';
import { UserModules } from '../types/auth.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const userModulesApi = {
  get: (accessToken?: string | null): Promise<UserModules> =>
    apiFetch<UserModules>('/api/users/modules', { headers: authHeaders(accessToken) }),

  update: (modules: UserModules, accessToken?: string | null): Promise<UserModules> =>
    apiFetch<UserModules>('/api/users/modules', {
      method: 'PUT',
      body: JSON.stringify(modules),
      headers: authHeaders(accessToken),
    }),
};
