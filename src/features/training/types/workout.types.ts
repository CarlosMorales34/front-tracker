export interface WorkoutExercise {
  id: string;
  name: string;
  // Para ejercicios de peso corporal (dominadas, lagartijas), `weight` deja
  // de ser "cuánto pesas" y pasa a ser peso ADICIONAL opcional (ej.
  // dominadas lastradas) -- null/0 = sin peso extra.
  weight: number | null;
  isBodyweight: boolean;
  sets: number;
  reps: number[];
}

export interface Workout {
  id: string;
  workoutDate: string;
  sourceRoutineId: string | null;
  durationSeconds: number;
  comments: string | null;
  exercises: WorkoutExercise[];
}

export interface CreateWorkoutExerciseInput {
  name: string;
  weight: number | null;
  isBodyweight: boolean;
  sets: number;
  reps: number[];
}

export interface CreateWorkoutInput {
  workoutDate?: string;
  sourceRoutineId?: string | null;
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
  isBodyweight: boolean;
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
  isBodyweight: boolean;
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
  sourceRoutineId: string | null;
  volume: number;
  exercises: SessionVolumeExercise[];
}

export interface ExercisePerformanceSeries {
  name: string;
  history: { workoutDate: string; sourceRoutineId: string | null; weight: number | null; totalReps: number }[];
}

export interface WorkoutPerformance {
  sessions: SessionVolumePoint[];
  exercises: ExercisePerformanceSeries[];
}

// Racha de ENTRENAMIENTO -- distinta de la racha de Actividades del Home.
export interface TrainingStreak {
  days: number;
  hasData: boolean;
}

// Días (0=domingo..6=sábado) que el usuario marcó como descanso -- no
// rompen la racha de entrenamiento aunque no haya sesión ese día.
export interface TrainingSettings {
  restWeekdays: number[];
}
