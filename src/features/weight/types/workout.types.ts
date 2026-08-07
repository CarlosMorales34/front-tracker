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
  workoutDate?: string;
  durationSeconds: number;
  comments: string | null;
  exercises: CreateWorkoutExerciseInput[];
}

export interface UpdateWorkoutInput {
  workoutDate: string;
  durationSeconds: number;
  comments: string | null;
  exercises: CreateWorkoutExerciseInput[];
}

export interface WorkoutRoutineExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  suggestedWeight: number | null;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  weekday: number | null;
  exercises: WorkoutRoutineExercise[];
}

export interface WorkoutRoutineExerciseInput {
  name: string;
  targetSets: number;
  targetReps: number;
  suggestedWeight: number | null;
}

export interface WorkoutRoutineInput {
  name: string;
  weekday: number | null;
  exercises: WorkoutRoutineExerciseInput[];
}

export interface SessionVolumeExercise {
  name: string;
  weight: number | null;
  sets: number;
  reps: number[];
}

export interface SessionVolumePoint {
  workoutDate: string;
  volume: number;
  exercises: SessionVolumeExercise[];
}

export interface ExercisePerformanceSeries {
  name: string;
  history: { workoutDate: string; weight: number | null; totalReps: number }[];
}

export interface WorkoutPerformance {
  sessions: SessionVolumePoint[];
  exercises: ExercisePerformanceSeries[];
}
