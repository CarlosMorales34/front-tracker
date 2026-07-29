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
  // Actividad a la que se reflejan los horarios de esta rutina (solo
  // aplica a rutinas type=range -- un horario "single" no tiene duración).
  linkedActivityId: string | null;
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

export type ActivityTimeSource = 'manual' | 'routine';

export interface ActivityTimeRange {
  start: string;
  end: string;
  source: ActivityTimeSource;
  // Nombre de la rutina fija que originó este turno (solo si source='routine').
  // Esas entradas son de solo lectura acá -- se editan desde la rutina.
  routineName: string | null;
}

export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
  // Total del día seleccionado (activitiesApi.listActivities(token, date)):
  // suma de todos los turnos, manuales + reflejados de una rutina vinculada.
  todayHours: number | null;
  // Turnos individuales del día seleccionado.
  todayTimes: ActivityTimeRange[];
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
