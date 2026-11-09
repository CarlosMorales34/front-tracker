import { trainingFetch, type TrainingReadContext } from './training-fetch';
import type { WorkoutRoutine, WorkoutRoutineInput } from '../types/workout.types';

export const workoutRoutineApi = {
  list: (accessToken?: string | null, context?: TrainingReadContext): Promise<WorkoutRoutine[]> =>
    trainingFetch('/api/workout-routines', accessToken, undefined, context),

  create: (input: WorkoutRoutineInput, accessToken?: string | null): Promise<WorkoutRoutine> =>
    trainingFetch('/api/workout-routines', accessToken, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: WorkoutRoutineInput, accessToken?: string | null): Promise<WorkoutRoutine> =>
    trainingFetch(`/api/workout-routines/${id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  delete: (id: string, accessToken?: string | null): Promise<void> =>
    trainingFetch(`/api/workout-routines/${id}`, accessToken, { method: 'DELETE' }),
};
