import { getTodayIso, getWeekDayChips, getWeekdayOfDateIso } from '../../../shared/lib/week';
import { CatalogExercise, WorkoutRoutine } from '../types/workout.types';

export const TRAINING_WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

export function getTrainingWeekStartIso(dateIso = getTodayIso()): string {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getTrainingDayChips(weekStartIso: string, includeWeekend = false) {
  return getWeekDayChips(weekStartIso).slice(0, includeWeekend ? 7 : 5);
}

export function formatTrainingWeekRange(weekStartIso: string, includeWeekend = false): string {
  const days = getTrainingDayChips(weekStartIso, includeWeekend);
  const formatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
  return formatter.formatRange(new Date(`${days[0]!.dateIso}T00:00:00`), new Date(`${days.at(-1)!.dateIso}T00:00:00`));
}

export function routinesForDate(routines: WorkoutRoutine[], dateIso: string): WorkoutRoutine[] {
  const weekday = getWeekdayOfDateIso(dateIso);
  return routines.filter(routine => (routine.weekdays ?? (routine.weekday === null ? [] : [routine.weekday])).includes(weekday));
}

function exerciseKey(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function catalogForRoutines(catalog: CatalogExercise[], routines: WorkoutRoutine[]): CatalogExercise[] {
  const ids = new Set(routines.flatMap(routine => routine.exercises.flatMap(exercise => exercise.exerciseId ? [exercise.exerciseId] : [])));
  const names = new Set(routines.flatMap(routine => routine.exercises.map(exercise => exerciseKey(exercise.name))));
  return catalog.filter(exercise => ids.has(exercise.id) || names.has(exerciseKey(exercise.name)) || exercise.aliases.some(alias => names.has(exerciseKey(alias))));
}
