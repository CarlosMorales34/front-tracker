export interface WorkoutExercise {
  id: string;
  name: string;
  weight: number | null;
  sets: number;
  reps: number[];
}

export interface Workout {
  id: string;
  workoutDate: string;
  durationSeconds: number;
  comments: string | null;
  exercises: WorkoutExercise[];
}

export interface CreateWorkoutExerciseInput {
  name: string;
  weight: number | null;
  sets: number;
  reps: number[];
}

export interface CreateWorkoutInput {
  durationSeconds: number;
  comments: string | null;
  exercises: CreateWorkoutExerciseInput[];
}

export interface SessionVolumePoint {
  workoutDate: string;
  volume: number;
}

export interface ExercisePerformanceSeries {
  name: string;
  history: { workoutDate: string; weight: number | null; totalReps: number }[];
}

export interface WorkoutPerformance {
  sessions: SessionVolumePoint[];
  exercises: ExercisePerformanceSeries[];
}
