export interface AnnualCounter {
  id: string;
  name: string;
  year: number;
  value: number;
  previousYearValue: number | null;
}

export interface CreateAnnualCounterInput {
  name: string;
  year: number;
  value: number;
}

export interface WeekProductivity {
  weekNumber: number;
  year: number;
  rangeLabel: string;
  percent: number | null; // null = sin datos (semana futura o sin logs)
}

export interface WeekDetail {
  weekNumber: number;
  year: number;
  rangeLabel: string;
  percent: number | null;
  deltaVsPreviousWeek: number | null;
  categoryHours: { categoryId: string; name: string; color: string; hours: number }[];
  topActivities: { name: string; hours: number }[];
  notes: string;
}

export interface SetWeekNotesInput {
  year: number;
  weekNumber: number;
  notes: string;
}

export interface CategoryDistribution {
  categoryId: string;
  name: string;
  color: string;
  hours: number;
  percent: number;
}

export interface AnnualProductivitySummary {
  year: number;
  weeks: WeekProductivity[];
  annualPercent: number | null;
  weeksWithData: number;
  categoryDistribution: CategoryDistribution[];
}
