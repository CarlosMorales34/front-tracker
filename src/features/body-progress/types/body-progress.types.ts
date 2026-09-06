export type BodyGoalType = 'lose' | 'gain' | 'maintain' | 'recomp';
export type Trend = 'up' | 'down' | 'stable';

export interface BodyMeasurement {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipsCm: number | null;
  notes: string | null;
  source: 'manual';
}

export interface BodyGoal {
  id: string;
  goalType: BodyGoalType;
  startWeightKg: number;
  targetWeightKg: number | null;
  startDate: string;
  targetDate: string | null;
  isActive: boolean;
}

export interface BodyProgressSummary {
  currentWeightKg: number | null;
  deltaVsPreviousPeriod: number | null;
  totalChangeSinceStart: number | null;
  distanceToGoal: number | null;
  percentProgress: number | null;
  weeklyPaceKg: number | null;
  trend: Trend;
  isProgressFavorable: boolean | null;
  goal: BodyGoal | null;
  latestMeasurement: { id: string; measuredAt: string; weightKg: number | null } | null;
}

export interface MeasurementFields {
  measuredAt: string;
  weightKg?: number | null;
  bodyFatPercentage?: number | null;
  waistCm?: number | null;
  chestCm?: number | null;
  hipsCm?: number | null;
  notes?: string | null;
}

export type CreateMeasurementInput = MeasurementFields;
export type UpdateMeasurementInput = Partial<MeasurementFields>;

export interface SetGoalInput {
  goalType: BodyGoalType;
  startWeightKg: number;
  targetWeightKg?: number | null;
  startDate: string;
  targetDate?: string | null;
}
