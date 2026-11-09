import { trainingFetch, type TrainingReadContext } from './training-fetch';
import type { CatalogExercise } from '../types/workout.types';

export const exerciseCatalogApi = {
  list: (token?: string | null, context?: TrainingReadContext) => trainingFetch<CatalogExercise[]>('/api/exercise-catalog', token, undefined, context),
  create: (name: string, token?: string | null) => trainingFetch<CatalogExercise>('/api/exercise-catalog', token, { method: 'POST', body: JSON.stringify({ name }) }),
  rename: (id: string, name: string, token?: string | null) => trainingFetch<void>(`/api/exercise-catalog/${id}`, token, { method: 'PUT', body: JSON.stringify({ name }) }),
  merge: (id: string, targetId: string, token?: string | null) => trainingFetch<void>(`/api/exercise-catalog/${id}/merge`, token, { method: 'POST', body: JSON.stringify({ targetId }) }),
};
