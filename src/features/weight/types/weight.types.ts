export type WeightGoalDirection = 'lose' | 'gain';

export interface WeightMonthEntry {
  year: number;
  month: number; // 1-12
  value: number | null;
  note: string | null;
}

export interface SetWeightMonthInput {
  year: number;
  month: number;
  value: number | null;
}

export interface SetWeightNoteInput {
  year: number;
  month: number;
  note: string;
}

export interface WeightSettings {
  goalKg: number;
  // 'lose' = "mejor" es el valor más bajo del período; 'gain' = "mejor" es
  // el más alto -- configurable porque no todos buscan bajar de peso.
  goalDirection: WeightGoalDirection;
}

export interface WeightYearSummary {
  year: number;
  months: WeightMonthEntry[];
  currentWeight: number | null;
  deltaVsPreviousMonth: number | null;
  bestEver: { value: number; year: number; month: number } | null;
  goalKg: number;
  goalDirection: WeightGoalDirection;
}

export interface WeightYearExtreme {
  year: number;
  bestMonth: number;
  bestValue: number;
  worstMonth: number;
  worstValue: number;
}
