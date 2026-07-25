import { apiFetch } from '../../../shared/lib/api-client';
import { CreateWorkoutInput, Workout, WorkoutPerformance } from '../types/workout.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const workoutApi = {
  listForWeek: (weekStart: string, accessToken?: string | null): Promise<Workout[]> =>
    apiFetch<Workout[]>(`/api/workouts?weekStart=${weekStart}`, { headers: authHeaders(accessToken) }),

  create: (input: CreateWorkoutInput, accessToken?: string | null): Promise<Workout> =>
    apiFetch<Workout>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  delete: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/workouts/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  getPerformance: (accessToken?: string | null): Promise<WorkoutPerformance> =>
    apiFetch<WorkoutPerformance>('/api/workouts/performance', { headers: authHeaders(accessToken) }),
};
