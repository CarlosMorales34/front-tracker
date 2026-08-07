import { apiFetch } from '../../../shared/lib/api-client';
import { WorkoutRoutine, WorkoutRoutineInput } from '../types/workout.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const workoutRoutineApi = {
  list: (accessToken?: string | null): Promise<WorkoutRoutine[]> =>
    apiFetch<WorkoutRoutine[]>('/api/workout-routines', { headers: authHeaders(accessToken) }),

  create: (input: WorkoutRoutineInput, accessToken?: string | null): Promise<WorkoutRoutine> =>
    apiFetch<WorkoutRoutine>('/api/workout-routines', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  update: (id: string, input: WorkoutRoutineInput, accessToken?: string | null): Promise<WorkoutRoutine> =>
    apiFetch<WorkoutRoutine>(`/api/workout-routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  delete: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/workout-routines/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),
};
