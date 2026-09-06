export type SuggestionType =
  | 'create_routine'
  | 'update_routine'
  | 'fill_activity_fields'
  | 'suggest_category'
  | 'suggest_activity_name'
  | 'suggest_duration'
  | 'suggest_schedule'
  | 'suggest_next_occurrence';

export type SuggestionStatus = 'pending' | 'accepted' | 'accepted_with_changes' | 'dismissed' | 'expired';

export interface ActivitySuggestion {
  id: string;
  suggestionType: SuggestionType;
  activityId: string | null;
  categoryId: string | null;
  routineId: string | null;
  suggestedActivityName: string | null;
  suggestedCategoryId: string | null;
  suggestedDays: number[] | null;
  suggestedStartTime: string | null;
  suggestedEndTime: string | null;
  suggestedDurationMinutes: number | null;
  suggestedStartDate: string | null;
  suggestedEndDate: string | null;
  confidence: number;
  sampleCount: number;
  distinctWeeks: number;
  reason: string;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface UserSuggestionSettings {
  suggestionsEnabled: boolean;
}

export interface AcceptSuggestionInput {
  finalValues?: Record<string, unknown>;
}
