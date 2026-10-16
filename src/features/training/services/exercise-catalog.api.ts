import { apiFetch } from '../../../shared/lib/api-client';
import { CatalogExercise } from '../types/workout.types';

const headers = (token?: string | null): HeadersInit => token ? { Authorization: `Bearer ${token}` } : {};
export const exerciseCatalogApi = {
  list: (token?: string | null) => apiFetch<CatalogExercise[]>('/api/exercise-catalog', { headers: headers(token) }),
  create: (name: string, token?: string | null) => apiFetch<CatalogExercise>('/api/exercise-catalog', { method: 'POST', headers: headers(token), body: JSON.stringify({ name }) }),
  rename: (id: string, name: string, token?: string | null) => apiFetch<void>(`/api/exercise-catalog/${id}`, { method: 'PUT', headers: headers(token), body: JSON.stringify({ name }) }),
  merge: (id: string, targetId: string, token?: string | null) => apiFetch<void>(`/api/exercise-catalog/${id}/merge`, { method: 'POST', headers: headers(token), body: JSON.stringify({ targetId }) }),
};
