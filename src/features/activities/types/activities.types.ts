export type RoutineType = 'single' | 'range';

export interface RoutineTimeRange {
  start: string;
  end?: string | null;
}

export interface FixedRoutine {
  id: string;
  icon: string;
  name: string;
  type: RoutineType;
  sortOrder: number;
  // Vacío salvo que se haya pedido con ?date= (activitiesApi.listRoutines(date, ...)).
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
  // Horas del día seleccionado (activitiesApi.listActivities(token, date)).
  todayHours: number | null;
  // Horas por día de la semana en vista (activitiesApi.listActivityLogs),
  // no viene poblado por listActivities -- ActivitiesView lo arma aparte.
  weekHours: (number | null)[];
}

export interface ActivityLog {
  id: string;
  activityId: string;
  logDate: string;
  hours: number;
  note: string | null;
}
