export type RoutineType = 'single' | 'range';

export interface RoutineTimeRange {
  start: string;
  end?: string;
}

export interface FixedRoutine {
  id: string;
  icon: string;
  name: string;
  type: RoutineType;
  sortOrder: number;
  // El backend todavía no tiene endpoint de registro por día (routine_logs)
  // -- hasta que exista, una rutina recién creada/listada no trae horarios.
  times: RoutineTimeRange[];
}

export interface DayChip {
  dateIso: string;
  weekdayLabel: string;
  dayNumber: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
  // El backend todavía no tiene endpoint de registro por día (activity_logs)
  // -- hasta que exista, todas las horas se muestran vacías ("–").
  todayHours: number | null;
  weekHours: (number | null)[];
}
