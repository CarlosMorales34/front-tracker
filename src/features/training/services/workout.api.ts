import { trainingFetch, type TrainingReadContext } from './training-fetch';
import type {
  CreateWorkoutInput,
  TrainingSettings,
  TrainingStreak,
  UpdateWorkoutInput,
  Workout,
  WorkoutPerformance,
} from '../types/workout.types';

export const workoutApi = {
  listForWeek: (weekStart: string, accessToken?: string | null, context?: TrainingReadContext): Promise<Workout[]> =>
    trainingFetch(`/api/workouts?weekStart=${weekStart}`, accessToken, undefined, context),

  create: (input: CreateWorkoutInput, accessToken?: string | null): Promise<Workout> =>
    trainingFetch('/api/workouts', accessToken, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateWorkoutInput, accessToken?: string | null): Promise<Workout> =>
    trainingFetch(`/api/workouts/${id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  delete: (id: string, accessToken?: string | null): Promise<void> =>
    trainingFetch(`/api/workouts/${id}`, accessToken, { method: 'DELETE' }),

  getPerformance: (accessToken?: string | null, context?: TrainingReadContext): Promise<WorkoutPerformance> =>
    trainingFetch('/api/workouts/performance', accessToken, undefined, context),

  getStreak: (accessToken?: string | null, context?: TrainingReadContext): Promise<TrainingStreak> =>
    trainingFetch('/api/workouts/streak', accessToken, undefined, context),

  getSettings: (accessToken?: string | null, context?: TrainingReadContext): Promise<TrainingSettings> =>
    trainingFetch('/api/workouts/settings', accessToken, undefined, context),

  updateSettings: (input: TrainingSettings, accessToken?: string | null): Promise<TrainingSettings> =>
    trainingFetch('/api/workouts/settings', accessToken, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
};
